
package br.com.vertice.service;

import br.com.vertice.model.Contrato;
import br.com.vertice.model.Pedido;
import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.ContratoRepository;
import br.com.vertice.repository.PedidoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class AgenteService {

    private final PedidoRepository pedidoRepository;
    private final AutomovelRepository automovelRepository;
    private final ContratoRepository contratoRepository;

    public AgenteService(
            PedidoRepository pedidoRepository,
            AutomovelRepository automovelRepository,
            ContratoRepository contratoRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
        this.contratoRepository = contratoRepository;
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
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

        // Bloqueia o automóvel durante a aprovação,
        // evitando conflitos entre reservas simultâneas.
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

        // Aprova o pedido.
        pedido.setStatus("APROVADO");

        Pedido pedidoAprovado = pedidoRepository.save(pedido);

        // Gera o contrato vinculado ao pedido aprovado.
        Contrato contrato = new Contrato();

        contrato.setPedidoId(pedidoAprovado.getId());

        // UUID garante uma identificação única
        // para o número do contrato.
        contrato.setNumero(
                "VERT-" + UUID.randomUUID().toString()
        );

        contrato.setStatus("EM_EXECUCAO");

        // Estes campos são opcionais na tabela atual.
        // Serão preenchidos quando implementarmos
        // a funcionalidade financeira.
        contrato.setBancoAgenteId(null);
        contrato.setValorCredito(null);

        contratoRepository.save(contrato);

        // As duas operações fazem parte da mesma transação.
        // Se o contrato não puder ser salvo,
        // a aprovação também será revertida.
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
