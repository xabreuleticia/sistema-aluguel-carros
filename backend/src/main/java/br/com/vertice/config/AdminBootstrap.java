
package br.com.vertice.config;

import br.com.vertice.model.Usuario;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Component
public class AdminBootstrap implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${vertice.admin.bootstrap.enabled:false}")
    private boolean habilitado;

    @Value("${vertice.admin.bootstrap.nome:}")
    private String nome;

    @Value("${vertice.admin.bootstrap.email:}")
    private String email;

    @Value("${vertice.admin.bootstrap.senha:}")
    private String senha;

    public AdminBootstrap(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!habilitado) {
            return;
        }

        // Nunca recria ou altera administradores
        // quando já existe um administrador ativo.
        if (usuarioRepository.countByPerfilAndAtivoTrue(
                "ADMIN"
        ) > 0) {
            return;
        }

        if (nome == null || nome.isBlank()
                || email == null || email.isBlank()
                || senha == null || senha.length() < 12) {
            throw new IllegalStateException(
                    "Configure nome, e-mail e senha de pelo menos 12 caracteres para o administrador inicial."
            );
        }

        String emailNormalizado = email.trim()
                .toLowerCase(Locale.ROOT);

        if (!emailNormalizado.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        )) {
            throw new IllegalStateException(
                    "E-mail do administrador inicial inválido."
            );
        }

        if (usuarioRepository.existsByEmail(
                emailNormalizado
        )) {
            throw new IllegalStateException(
                    "O e-mail do administrador inicial já pertence a outra conta. Use um e-mail exclusivo."
            );
        }

        Usuario administrador = new Usuario();

        administrador.setNome(nome.trim());
        administrador.setEmail(emailNormalizado);
        administrador.setSenhaHash(
                passwordEncoder.encode(senha)
        );
        administrador.setPerfil("ADMIN");
        administrador.setTipoAgente(null);
        administrador.setAtivo(true);

        usuarioRepository.save(administrador);

        System.out.println(
                "Administrador inicial criado com sucesso."
        );
    }
}
