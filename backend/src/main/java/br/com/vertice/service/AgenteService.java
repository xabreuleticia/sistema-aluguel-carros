
package br.com.vertice.service;

import br.com.vertice.model.Contrato;
import br.com.vertice.model.Pedido;
import br.com.vertice.model.Cliente;
import br.com.vertice.model.Emprego;

import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.EmpregoRepository;
import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.ContratoRepository;
import br.com.vertice.repository.PedidoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class AgenteService {

    private final PedidoRepository pedidoRepository;
    private final AutomovelRepository automovelRepository;
    private final ContratoRepository contratoRepository;
    private final ClienteRepository clienteRepository;
    private final EmpregoRepository empregoRepository;

    public AgenteService(
            PedidoRepository pedidoRepository,
            AutomovelRepository automovelRepository,
            ContratoRepository contratoRepository,
            ClienteRepository clienteRepository,
            EmpregoRepository empregoRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
        this.contratoRepository = contratoRepository;
        this.clienteRepository = clienteRepository;
        this.empregoRepository = empregoRepository;
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public record EmpregoFinanceiro(
            String empresa,
            BigDecimal rendimento
    ) {}

    public record AnaliseFinanceira(
            UUID pedidoId,
            String profissao,
            BigDecimal valorPedido,
            BigDecimal rendaTotalInformada,
            List<EmpregoFinanceiro> empregos
    ) {}

    @Transactional(readOnly = true)
    public AnaliseFinanceira consultarAnaliseFinanceira(
            UUID pedidoId
    ) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido não encontrado."
                ));

        Cliente cliente = clienteRepository
                .findById(pedido.getClienteId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente do pedido não encontrado."
                ));

        List<Emprego> empregos =
                empregoRepository.findByClienteId(cliente.getId());

        BigDecimal renda = empregos.stream()
                .map(Emprego::getRendimento)
                .filter(valor -> valor != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<EmpregoFinanceiro> detalhes = empregos.stream()
                .map(emprego -> new EmpregoFinanceiro(
                        emprego.getEmpresa(),
                        emprego.getRendimento()
                ))
                .toList();

        return new AnaliseFinanceira(
                pedido.getId(),
                cliente.getProfissao(),
                pedido.getValorTotal(),
                renda,
                detalhes
        );
    }

    @Transactional
    public Pedido aprovar(UUID pedidoId) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido não encontrado."
                ));

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já foi analisado."
            );
        }

        // Bloqueia o automóvel durante a aprovação
        // para evitar conflitos entre reservas simultâneas.
        var automovel = automovelRepository
                .buscarPorIdComBloqueio(pedido.getAutomovelId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Automóvel não encontrado."
                ));

        if (!automovel.isDisponivel()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este automóvel está indisponível."
            );
        }

        boolean conflito = pedidoRepository
                .existeReservaConflitante(
                        pedido.getAutomovelId(),
                        pedido.getDataInicio(),
                        pedido.getDataFim()
                );

        if (conflito) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este automóvel já possui uma reserva aprovada "
                            + "para o período solicitado."
            );
        }

        // Impede a criação de outro contrato
        // para o mesmo pedido.
        if (contratoRepository.existsByPedidoId(pedidoId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já possui um contrato."
            );
        }

        pedido.setStatus("APROVADO");

        Pedido pedidoAprovado = pedidoRepository.save(pedido);

        // Gera o contrato vinculado ao pedido aprovado.
        Contrato contrato = new Contrato();

        contrato.setPedidoId(pedidoAprovado.getId());

        contrato.setNumero(
                "VERT-" + UUID.randomUUID().toString()
        );

        contrato.setStatus("EM_EXECUCAO");

        // Campos reservados para o contrato
        // de crédito bancário.
        contrato.setBancoAgenteId(null);
        contrato.setValorCredito(null);

        contratoRepository.save(contrato);

        // Se o contrato não puder ser salvo,
        // a aprovação será revertida.
        return pedidoAprovado;
    }

    @Transactional
    public Pedido recusar(UUID pedidoId) {

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido não encontrado."
                ));

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já foi analisado."
            );
        }

        pedido.setStatus("RECUSADO");

        return pedidoRepository.save(pedido);
    }
}
