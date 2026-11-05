
package br.com.vertice.controller;

import br.com.vertice.model.Automovel;
import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.PedidoRepository;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/automoveis")
public class DisponibilidadeController {

    private final AutomovelRepository automovelRepository;
    private final PedidoRepository pedidoRepository;

    public DisponibilidadeController(
            AutomovelRepository automovelRepository,
            PedidoRepository pedidoRepository
    ) {
        this.automovelRepository = automovelRepository;
        this.pedidoRepository = pedidoRepository;
    }

    @GetMapping("/disponibilidade")
    public Map<String, Object> consultarDisponibilidade(
            @RequestParam UUID automovelId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicio,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFim
    ) {

        if (dataInicio.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A retirada não pode estar no passado."
            );
        }

        if (!dataFim.isAfter(dataInicio)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A devolução deve ser posterior à retirada."
            );
        }

        Automovel automovel = automovelRepository
                .findById(automovelId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Automóvel não encontrado."
                        )
                );

        boolean conflito = pedidoRepository.existeReservaConflitante(
                automovelId,
                dataInicio,
                dataFim
        );

        boolean disponivel =
                automovel.isDisponivel() && !conflito;

        return Map.of(
                "automovelId", automovelId,
                "disponivel", disponivel,
                "dataInicio", dataInicio.toString(),
                "dataFim", dataFim.toString()
        );
    }
}
