
package br.com.vertice.service;

import br.com.vertice.model.Pedido;
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

    public AgenteService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public Pedido aprovar(UUID pedidoId) {
        return atualizarStatus(pedidoId, "APROVADO");
    }

    @Transactional
    public Pedido recusar(UUID pedidoId) {
        return atualizarStatus(pedidoId, "RECUSADO");
    }

    private Pedido atualizarStatus(UUID pedidoId, String novoStatus) {

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

        pedido.setStatus(novoStatus);

        return pedidoRepository.save(pedido);
    }
}
