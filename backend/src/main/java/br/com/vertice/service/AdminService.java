
package br.com.vertice.service;

import br.com.vertice.model.Usuario;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public record UsuarioResumo(
            UUID id,
            String nome,
            String email,
            String perfil,
            String tipoAgente,
            boolean ativo
    ) {}

    public record CriarAgenteRequest(
            String nome,
            String email,
            String senha,
            String tipoAgente
    ) {}

    public record AtualizarUsuarioRequest(
            String nome,
            String perfil,
            String tipoAgente,
            Boolean ativo
    ) {}

    private UsuarioResumo resumo(Usuario usuario) {
        return new UsuarioResumo(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil(),
                usuario.getTipoAgente(),
                usuario.isAtivo()
        );
    }

    private String textoObrigatorio(
            String valor,
            String campo
    ) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    campo + " é obrigatório."
            );
        }

        return valor.trim();
    }

    private String normalizarEmail(String email) {
        String resultado = textoObrigatorio(email, "E-mail")
                .toLowerCase(Locale.ROOT);

        if (!resultado.matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
        )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um e-mail válido."
            );
        }

        return resultado;
    }

    private String validarTipoAgente(String tipo) {
        if (!"EMPRESA".equals(tipo)
                && !"BANCO".equals(tipo)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O tipo de agente deve ser EMPRESA ou BANCO."
            );
        }

        return tipo;
    }

    @Transactional(readOnly = true)
    public List<UsuarioResumo> listar() {
        return usuarioRepository.findAll()
                .stream()
                .sorted((a, b) ->
                        a.getNome().compareToIgnoreCase(b.getNome())
                )
                .map(this::resumo)
                .toList();
    }

    @Transactional
    public UsuarioResumo criarAgente(
            CriarAgenteRequest dados
    ) {
        if (dados == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe os dados do agente."
            );
        }

        String nome = textoObrigatorio(
                dados.nome(), "Nome"
        );

        String email = normalizarEmail(dados.email());

        String tipo = validarTipoAgente(
                dados.tipoAgente()
        );

        String senha = textoObrigatorio(
                dados.senha(), "Senha"
        );

        if (nome.length() > 150
                || email.length() > 255
                || senha.length() < 12
                || senha.length() > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Verifique os limites dos campos. A senha deve ter entre 12 e 72 caracteres."
            );
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado."
            );
        }

        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenhaHash(
                passwordEncoder.encode(senha)
        );
        usuario.setPerfil("AGENTE");
        usuario.setTipoAgente(tipo);
        usuario.setAtivo(true);

        return resumo(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResumo atualizar(
            UUID id,
            AtualizarUsuarioRequest dados,
            String emailAdministrador
    ) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Usuário não encontrado."
                        )
                );

        if (dados == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe os dados de atualização."
            );
        }

        String nome = textoObrigatorio(
                dados.nome(), "Nome"
        );

        String perfil = textoObrigatorio(
                dados.perfil(), "Perfil"
        );

        if (nome.length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nome muito longo."
            );
        }

        if (!List.of("CLIENTE", "AGENTE", "ADMIN")
                .contains(perfil)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Perfil inválido."
            );
        }

        if (dados.ativo() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe se a conta está ativa."
            );
        }

        if (usuario.getEmail()
                .equalsIgnoreCase(emailAdministrador)) {
            if (!"ADMIN".equals(perfil)
                    || !dados.ativo()) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Você não pode remover seu próprio acesso administrativo."
                );
            }
        }

        String tipo = null;

        if ("AGENTE".equals(perfil)) {
            tipo = validarTipoAgente(
                    dados.tipoAgente()
            );
        }

        usuario.setNome(nome);
        usuario.setPerfil(perfil);
        usuario.setTipoAgente(tipo);
        usuario.setAtivo(dados.ativo());

        return resumo(usuarioRepository.save(usuario));
    }
}
