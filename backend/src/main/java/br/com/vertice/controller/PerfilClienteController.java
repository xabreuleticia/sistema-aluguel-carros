
package br.com.vertice.controller;

import br.com.vertice.service.PerfilClienteService;
import br.com.vertice.service.PerfilClienteService.PerfilDados;
import br.com.vertice.service.PerfilClienteService.PerfilResposta;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/perfil")
public class PerfilClienteController {

    private final PerfilClienteService perfilClienteService;

    public PerfilClienteController(
            PerfilClienteService perfilClienteService
    ) {
        this.perfilClienteService = perfilClienteService;
    }

    @GetMapping
    public PerfilResposta consultar(Authentication authentication) {
        return perfilClienteService.consultar(authentication);
    }

    @PutMapping
    public PerfilResposta atualizar(
            @RequestBody PerfilDados dados,
            Authentication authentication
    ) {
        return perfilClienteService.atualizar(
                dados,
                authentication
        );
    }
}
