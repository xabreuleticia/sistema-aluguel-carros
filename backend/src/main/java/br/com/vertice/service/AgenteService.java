
package br.com.vertice.service;

import br.com.vertice.model.Cliente;
import br.com.vertice.model.Contrato;
import br.com.vertice.model.Emprego;
import br.com.vertice.model.Pedido;
import br.com.vertice.model.Usuario;

import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.ContratoRepository;
import br.com.vertice.repository.EmpregoRepository;
import br.com.vertice.repository.PedidoRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class AgenteService {

    private final PedidoRepository pedidoRepository;
    private final AutomovelRepository automovelRepository;
    private final ContratoRepository contratoRepository;
    private final ClienteRepository clienteRepository;
    private final EmpregoRepository empregoRepository;
    private final UsuarioRepository usuarioRepository;

    public AgenteService(
            PedidoRepository pedidoRepository,
            AutomovelRepository automovelRepository,
            ContratoRepository contratoRepository,
            ClienteRepository clienteRepository,
            EmpregoRepository empregoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
        this.contratoRepository = contratoRepository;
        this.clienteRepository = clienteRepository;
        this.empregoRepository = empregoRepository;
        this.usuarioRepository = usuarioRepository;
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

    public record RegistrarParecerRequest(
            String parecer,
            String justificativa,
            UUID bancoAgenteId,
            BigDecimal valorCredito
    ) {}

    @Transactional(readOnly = true)
    public AnaliseFinanceira consultarAnaliseFinanceira(
            UUID pedidoId
    ) {
        Pedido pedido = buscarPedido(pedidoId);

        Cliente cliente = clienteRepository
                .findById(pedido.getClienteId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente não encontrado."
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

    private Pedido buscarPedido(UUID id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Pedido não encontrado."
                ));
    }

    @Transactional
    public Pedido registrarParecer(
            UUID pedidoId,
            RegistrarParecerRequest dados
    ) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Somente pedidos pendentes podem ser analisados."
            );
        }

        if (pedido.getParecerFinanceiro() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já possui um parecer financeiro."
            );
        }

        if (dados == null
                || dados.parecer() == null
                || !List.of("FAVORAVEL", "DESFAVORAVEL")
                        .contains(dados.parecer())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um parecer válido."
            );
        }

        String justificativa = dados.justificativa() == null
                ? ""
                : dados.justificativa().trim();

        if (justificativa.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe a justificativa financeira."
            );
        }

        if (justificativa.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A justificativa deve ter até 2000 caracteres."
            );
        }

        UUID bancoId = dados.bancoAgenteId();
        BigDecimal credito = dados.valorCredito();

        if ("DESFAVORAVEL".equals(dados.parecer())) {
            if (bancoId != null || credito != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Um parecer desfavorável não pode conceder crédito."
                );
            }
        } else {
            boolean bancoInformado = bancoId != null;
            boolean creditoInformado = credito != null;

            if (bancoInformado != creditoInformado) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Informe o banco e o valor do crédito juntos."
                );
            }

            if (creditoInformado) {
                if (credito.compareTo(BigDecimal.ZERO) <= 0
                        || credito.compareTo(pedido.getValorTotal()) > 0) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "O crédito deve ser maior que zero e não pode superar o valor do pedido."
                    );
                }

                Usuario agente = usuarioRepository.findById(bancoId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Agente informado não encontrado."
                        ));

                if (!agente.isAtivo()
                        || !"AGENTE".equals(agente.getPerfil())) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Informe um agente ativo válido."
                    );
                }
            }
        }

        pedido.setParecerFinanceiro(dados.parecer());
        pedido.setJustificativaFinanceira(justificativa);
        pedido.setAnalisadoEm(OffsetDateTime.now());
        pedido.setBancoAgenteId(bancoId);
        pedido.setValorCredito(credito);

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido aprovar(UUID pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já foi analisado."
            );
        }

        if (!"FAVORAVEL".equals(pedido.getParecerFinanceiro())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "É necessário um parecer financeiro favorável."
            );
        }

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
                    "Este automóvel já possui uma reserva aprovada para o período."
            );
        }

        if (contratoRepository.existsByPedidoId(pedidoId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já possui um contrato."
            );
        }

        pedido.setStatus("APROVADO");
        Pedido aprovado = pedidoRepository.save(pedido);

        Contrato contrato = new Contrato();
        contrato.setPedidoId(aprovado.getId());
        contrato.setNumero(
                "VERT-" + UUID.randomUUID()
        );
        contrato.setStatus("EM_EXECUCAO");
        contrato.setBancoAgenteId(aprovado.getBancoAgenteId());
        contrato.setValorCredito(aprovado.getValorCredito());

        contratoRepository.save(contrato);

        return aprovado;
    }

    @Transactional
    public Pedido recusar(UUID pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

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
