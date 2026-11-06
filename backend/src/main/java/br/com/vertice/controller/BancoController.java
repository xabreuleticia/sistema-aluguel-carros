
package br.com.vertice.controller;

import br.com.vertice.service.BancoService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/banco")
public class BancoController {

    private final BancoService bancoService;

    public BancoController(BancoService bancoService) {
        this.bancoService = bancoService;
    }

    @GetMapping("/solicitacoes")
    public List<BancoService.SolicitacaoCredito> listar(
            Authentication authentication
    ) {
        return bancoService.listar(
                authentication.getName()
        );
    }

    @PatchMapping("/solicitacoes/{id}/decisao")
    public BancoService.SolicitacaoCredito decidir(
            @PathVariable UUID id,
            @RequestBody BancoService.DecisaoCreditoRequest dados,
            Authentication authentication
    ) {
        return bancoService.decidir(
                authentication.getName(),
                id,
                dados
        );
    }
}
