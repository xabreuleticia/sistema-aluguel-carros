
package br.com.vertice.controller;

import br.com.vertice.model.Contrato;
import br.com.vertice.model.Pedido;
import br.com.vertice.repository.ContratoRepository;
import br.com.vertice.service.ContratoPdfService;
import br.com.vertice.service.PedidoService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/contratos")
public class ContratoController {

    private final ContratoRepository contratoRepository;
    private final PedidoService pedidoService;
    private final ContratoPdfService contratoPdfService;

    public ContratoController(
            ContratoRepository contratoRepository,
            PedidoService pedidoService,
            ContratoPdfService contratoPdfService
    ) {
        this.contratoRepository = contratoRepository;
        this.pedidoService = pedidoService;
        this.contratoPdfService = contratoPdfService;
    }

    public record ContratoResposta(
            UUID id,
            UUID pedidoId,
            String numero,
            String status,
            OffsetDateTime geradoEm,
            LocalDate dataInicio,
            LocalDate dataFim,
            BigDecimal valorTotal
    ) {}

    // Busca um contrato para visualização.
    @GetMapping("/pedido/{pedidoId}")
    public ContratoResposta buscarPorPedido(
            @PathVariable UUID pedidoId,
            Authentication authentication
    ) {
        Pedido pedido = buscarPedidoAprovado(
                pedidoId,
                authentication
        );

        Contrato contrato = buscarContrato(pedidoId);

        return new ContratoResposta(
                contrato.getId(),
                contrato.getPedidoId(),
                contrato.getNumero(),
                contrato.getStatus(),
                contrato.getGeradoEm(),
                pedido.getDataInicio(),
                pedido.getDataFim(),
                pedido.getValorTotal()
        );
    }

    // Gera e disponibiliza o PDF para download.
    @GetMapping("/pedido/{pedidoId}/pdf")
    public ResponseEntity<byte[]> baixarPdf(
            @PathVariable UUID pedidoId,
            Authentication authentication
    ) {
        Pedido pedido = buscarPedidoAprovado(
                pedidoId,
                authentication
        );

        Contrato contrato = buscarContrato(pedidoId);

        byte[] pdf = contratoPdfService.gerarPdf(
                contrato,
                pedido
        );

        String nomeArquivo = "contrato-vertice-"
                + contrato.getId()
                + ".pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + nomeArquivo + "\""
                )
                .body(pdf);
    }

    // Confirma que o pedido pertence ao cliente autenticado.
    private Pedido buscarPedidoAprovado(
            UUID pedidoId,
            Authentication authentication
    ) {
        Pedido pedido = pedidoService.buscarMeuPedido(
                pedidoId,
                authentication
        );

        if (!"APROVADO".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O pedido não está aprovado."
            );
        }

        return pedido;
    }

    private Contrato buscarContrato(UUID pedidoId) {
        return contratoRepository
                .findByPedidoId(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Contrato não encontrado para este pedido."
                ));
    }
}
