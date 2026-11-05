
package br.com.vertice.service;

import br.com.vertice.model.Pedido;
import br.com.vertice.repository.PedidoRepository;
import br.com.vertice.repository.AutomovelRepository;

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

    public AgenteService(
            PedidoRepository pedidoRepository,
            AutomovelRepository automovelRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
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

        // Bloqueia o automóvel durante a verificação e
        // a aprovação, evitando aprovações simultâneas.
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

        pedido.setStatus("APROVADO");

        return pedidoRepository.save(pedido);
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
