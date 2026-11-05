package br.com.vertice.service;

import br.com.vertice.model.Pedido;
import br.com.vertice.repository.PedidoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public Pedido criar(Pedido pedido) {
        validar(pedido);

        long dias = ChronoUnit.DAYS.between(
            pedido.getDataInicio(),
            pedido.getDataFim()
        );

        pedido.setValorTotal(
            pedido.getValorDiaria().multiply(BigDecimal.valueOf(dias))
        );

        pedido.setStatus("PENDENTE");

        return pedidoRepository.save(pedido);
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    private void validar(Pedido pedido) {
        if (pedido.getClienteId() == null
                || pedido.getAutomovelId() == null
                || pedido.getDataInicio() == null
                || pedido.getDataFim() == null
                || pedido.getValorDiaria() == null) {
            throw new IllegalArgumentException(
                "Preencha todos os campos obrigatórios."
            );
        }

        if (pedido.getDataInicio().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                "A retirada não pode ser no passado."
            );
        }

        if (!pedido.getDataFim().isAfter(pedido.getDataInicio())) {
            throw new IllegalArgumentException(
                "A devolução deve ser posterior à retirada."
            );
        }

        if (pedido.getValorDiaria().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                "O valor da diária deve ser positivo."
            );
        }
    }
}
