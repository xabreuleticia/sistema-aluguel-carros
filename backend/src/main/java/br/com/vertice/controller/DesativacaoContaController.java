
package br.com.vertice.controller;

import br.com.vertice.service.DesativacaoContaService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/perfil")
public class DesativacaoContaController {

    private final DesativacaoContaService desativacaoContaService;

    public DesativacaoContaController(
            DesativacaoContaService desativacaoContaService
    ) {
        this.desativacaoContaService = desativacaoContaService;
    }

    public record DesativacaoRequest(String senha) {}

    @PostMapping("/desativar")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> desativar(
            @RequestBody DesativacaoRequest dados,
            Authentication authentication,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        desativacaoContaService.desativar(
                dados == null ? null : dados.senha(),
                authentication
        );

        new SecurityContextLogoutHandler().logout(
                request,
                response,
                authentication
        );

        return Map.of(
                "mensagem",
                "Sua conta foi desativada com sucesso."
        );
    }
}
