
package br.com.vertice.service;

import br.com.vertice.dto.LoginRequest;
import br.com.vertice.model.Usuario;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class LoginService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario validarCredenciais(LoginRequest dados) {

        String email = dados.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        Usuario usuario = usuarioRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "E-mail ou senha incorretos."
                ));

        if (!passwordEncoder.matches(
                dados.senha(),
                usuario.getSenhaHash())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "E-mail ou senha incorretos."
            );
        }

        return usuario;
    }

    
    public Usuario buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Usuário não encontrado."
            ));
    }

}
