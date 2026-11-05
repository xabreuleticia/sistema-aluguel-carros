
package br.com.vertice.controller;

import br.com.vertice.dto.CadastroClienteRequest;
import br.com.vertice.dto.LoginRequest;
import br.com.vertice.model.Usuario;
import br.com.vertice.service.CadastroService;
import br.com.vertice.service.LoginService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final CadastroService cadastroService;
    private final LoginService loginService;
    private final SecurityContextRepository contextRepository;

    public AuthController(
            CadastroService cadastroService,
            LoginService loginService,
            SecurityContextRepository contextRepository
    ) {
        this.cadastroService = cadastroService;
        this.loginService = loginService;
        this.contextRepository = contextRepository;
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of(
            "headerName", token.getHeaderName(),
            "token", token.getToken()
        );
    }

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> cadastrar(
            @Valid @RequestBody CadastroClienteRequest dados
    ) {
        UUID id = cadastroService.cadastrarCliente(dados);

        return Map.of(
            "mensagem", "Cadastro realizado com sucesso!",
            "usuarioId", id.toString()
        );
    }

    @PostMapping("/login")
    public Map<String, String> login(
            @Valid @RequestBody LoginRequest dados,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        Usuario usuario = loginService.validarCredenciais(dados);

        Authentication authentication =
            new UsernamePasswordAuthenticationToken(
                usuario.getEmail(),
                null,
                List.of(
                    new SimpleGrantedAuthority(
                        "ROLE_" + usuario.getPerfil()
                    )
                )
            );

        SecurityContext context =
            SecurityContextHolder.createEmptyContext();

        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        if (request.getSession(false) != null) {
            request.changeSessionId();
        }

        contextRepository.saveContext(
            context, request, response
        );

        return Map.of(
            "id", usuario.getId().toString(),
            "nome", usuario.getNome(),
            "email", usuario.getEmail(),
            "perfil", usuario.getPerfil()
        );
    }

    @GetMapping("/me")
    public Map<String, String> usuarioAtual(
            Authentication authentication
    ) {
        String email = authentication.getName();

        Usuario usuario = loginService.buscarPorEmail(email);

        return Map.of(
            "id", usuario.getId().toString(),
            "nome", usuario.getNome(),
            "email", usuario.getEmail(),
            "perfil", usuario.getPerfil()
        );
    }

    @PostMapping("/logout")
    public Map<String, String> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) {
        new SecurityContextLogoutHandler().logout(
            request, response, authentication
        );

        return Map.of("mensagem", "Sessão encerrada.");
    }
}
