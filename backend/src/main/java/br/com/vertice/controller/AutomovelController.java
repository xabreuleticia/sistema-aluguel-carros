
package br.com.vertice.controller;

import br.com.vertice.model.Automovel;
import br.com.vertice.model.Pedido;

import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.PedidoRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/automoveis")
public class AutomovelController {

    private final AutomovelRepository repository;
    private final PedidoRepository pedidoRepository;

    public AutomovelController(
            AutomovelRepository repository,
            PedidoRepository pedidoRepository
    ) {
        this.repository = repository;
        this.pedidoRepository = pedidoRepository;
    }

    @GetMapping
    public List<Automovel> listarDisponiveis() {
        return repository
                .findByDisponivelTrueOrderByMarcaAscModeloAsc();
    }

    public record PeriodoOcupado(
            LocalDate dataInicio,
            LocalDate dataFim
    ) {}

    @GetMapping("/{automovelId}/periodos-ocupados")
    public List<PeriodoOcupado> listarPeriodosOcupados(
            @PathVariable UUID automovelId
    ) {
        if (!repository.existsById(automovelId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Automóvel não encontrado."
            );
        }

        List<Pedido> pedidos = pedidoRepository
                .findByAutomovelIdAndStatusOrderByDataInicioAsc(
                        automovelId,
                        "APROVADO"
                );

        return pedidos.stream()
                .map(pedido -> new PeriodoOcupado(
                        pedido.getDataInicio(),
                        pedido.getDataFim()
                ))
                .toList();
    }
}
