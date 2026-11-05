
package br.com.vertice.service;

import br.com.vertice.model.Cliente;
import br.com.vertice.model.Emprego;
import br.com.vertice.model.Usuario;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.EmpregoRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PerfilClienteService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpregoRepository empregoRepository;

    public PerfilClienteService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            EmpregoRepository empregoRepository
    ) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.empregoRepository = empregoRepository;
    }

    public record EmpregoDados(
            String empresa,
            BigDecimal rendimento
    ) {}

    public record PerfilDados(
            String nome,
            String email,
            String cpf,
            String rg,
            String endereco,
            String profissao,
            List<EmpregoDados> empregos
    ) {}

    public record PerfilResposta(
            UUID id,
            String nome,
            String email,
            String cpf,
            String rg,
            String endereco,
            String profissao,
            List<EmpregoDados> empregos
    ) {}

    private Usuario buscarUsuario(Authentication authentication) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Faça login para continuar."
            );
        }

        return usuarioRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário não encontrado."
                ));
    }

    private Cliente buscarCliente(Usuario usuario) {
        return clienteRepository
                .findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cadastro de cliente não encontrado."
                ));
    }

    private String obrigatorio(String valor, String campo) {
        if (valor == null || valor.trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Preencha o campo " + campo + "."
            );
        }

        return valor.trim();
    }

    private PerfilResposta montarResposta(
            Usuario usuario,
            Cliente cliente
    ) {
        List<EmpregoDados> empregos = empregoRepository
                .findByClienteId(cliente.getId())
                .stream()
                .map(emprego -> new EmpregoDados(
                        emprego.getEmpresa(),
                        emprego.getRendimento()
                ))
                .toList();

        return new PerfilResposta(
                cliente.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                cliente.getCpf(),
                cliente.getRg(),
                cliente.getEndereco(),
                cliente.getProfissao(),
                empregos
        );
    }

    @Transactional(readOnly = true)
    public PerfilResposta consultar(Authentication authentication) {
        Usuario usuario = buscarUsuario(authentication);
        Cliente cliente = buscarCliente(usuario);

        return montarResposta(usuario, cliente);
    }

    @Transactional
    public PerfilResposta atualizar(
            PerfilDados dados,
            Authentication authentication
    ) {
        if (dados == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe os dados do perfil."
            );
        }

        Usuario usuario = buscarUsuario(authentication);
        Cliente cliente = buscarCliente(usuario);

        String nome = obrigatorio(dados.nome(), "nome");
        String email = obrigatorio(dados.email(), "e-mail")
                .toLowerCase(Locale.ROOT);
        String rg = obrigatorio(dados.rg(), "RG");
        String endereco = obrigatorio(
                dados.endereco(), "endereço"
        );
        String profissao = obrigatorio(
                dados.profissao(), "profissão"
        );

        if (!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um e-mail válido."
            );
        }

        if (!email.equals(usuario.getEmail())
                && usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este e-mail já está cadastrado."
            );
        }

        List<EmpregoDados> empregos = dados.empregos() == null
                ? List.of()
                : dados.empregos();

        if (empregos.size() > 3) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe no máximo três empregos."
            );
        }

        for (EmpregoDados emprego : empregos) {
            if (emprego == null
                    || emprego.empresa() == null
                    || emprego.empresa().isBlank()
                    || emprego.rendimento() == null
                    || emprego.rendimento()
                            .compareTo(BigDecimal.ZERO) < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Preencha corretamente os dados dos empregos."
                );
            }
        }

        usuario.setNome(nome);
        usuario.setEmail(email);

        cliente.setRg(rg);
        cliente.setEndereco(endereco);
        cliente.setProfissao(profissao);

        usuarioRepository.save(usuario);
        clienteRepository.save(cliente);

        List<Emprego> antigos = empregoRepository
                .findByClienteId(cliente.getId());

        empregoRepository.deleteAll(antigos);
        empregoRepository.flush();

        for (EmpregoDados item : empregos) {
            Emprego emprego = new Emprego();

            emprego.setClienteId(cliente.getId());
            emprego.setEmpresa(item.empresa().trim());
            emprego.setRendimento(item.rendimento());

            empregoRepository.save(emprego);
        }

        return montarResposta(usuario, cliente);
    }
}
