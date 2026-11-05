
package br.com.vertice.config;

import br.com.vertice.model.Usuario;
import br.com.vertice.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class ContaAtivaFilter extends OncePerRequestFilter {

    private final UsuarioRepository usuarioRepository;

    public ContaAtivaFilter(
            UsuarioRepository usuarioRepository
    ) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        Authentication authentication =
                SecurityContextHolder.getContext()
                        .getAuthentication();

        if (authentication != null
                && authentication.isAuthenticated()
                && !(authentication.getPrincipal()
                        instanceof String principal
                        && principal.equals("anonymousUser"))) {

            String email = authentication.getName();

            Optional<Usuario> usuario =
                    usuarioRepository.findByEmail(email);

            if (usuario.isEmpty() || !usuario.get().isAtivo()) {

                new SecurityContextLogoutHandler().logout(
                        request,
                        response,
                        authentication
                );

                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "Sua sessão foi encerrada. Faça login novamente."
                );

                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
