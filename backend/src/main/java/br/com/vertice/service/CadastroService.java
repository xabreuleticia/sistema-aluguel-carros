
package br.com.vertice.service;

import br.com.vertice.dto.CadastroClienteRequest;
import br.com.vertice.model.Cliente;
import br.com.vertice.model.Emprego;
import br.com.vertice.model.Usuario;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.EmpregoRepository;
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
public class CadastroService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpregoRepository empregoRepository;
    private final PasswordEncoder passwordEncoder;

    public CadastroService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            EmpregoRepository empregoRepository,
            PasswordEncoder passwordEncoder) {

        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.empregoRepository = empregoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UUID cadastrarCliente(CadastroClienteRequest dados) {

        String email = dados.email().trim().toLowerCase(Locale.ROOT);
        String cpf = dados.cpf().replaceAll("\\D", "");

        if (!cpf.matches("\\d{11}") || !cpfValido(cpf)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "CPF inválido."
            );
        }

        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "E-mail já cadastrado."
            );
        }

        if (clienteRepository.existsByCpf(cpf)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT, "CPF já cadastrado."
            );
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dados.nome().trim());
        usuario.setEmail(email);
        usuario.setSenhaHash(passwordEncoder.encode(dados.senha()));
        usuario.setPerfil("CLIENTE");

        usuario = usuarioRepository.saveAndFlush(usuario);

        Cliente cliente = new Cliente();
        cliente.setUsuarioId(usuario.getId());
        cliente.setCpf(cpf);
        cliente.setRg(dados.rg().trim());
        cliente.setEndereco(dados.endereco().trim());
        cliente.setProfissao(dados.profissao().trim());

        cliente = clienteRepository.saveAndFlush(cliente);

        List<CadastroClienteRequest.EmpregoRequest> empregos =
                dados.empregos() == null
                ? List.of()
                : dados.empregos();

        for (CadastroClienteRequest.EmpregoRequest item : empregos) {

            Emprego emprego = new Emprego();
            emprego.setClienteId(cliente.getId());
            emprego.setEmpresa(item.empresa().trim());
            emprego.setRendimento(item.rendimento());

            empregoRepository.save(emprego);
        }

        return usuario.getId();
    }

    private boolean cpfValido(String cpf) {
        if (cpf.matches("(\\d)\\1{10}")) {
            return false;
        }

        for (int tamanho = 9; tamanho <= 10; tamanho++) {
            int soma = 0;

            for (int i = 0; i < tamanho; i++) {
                soma += Character.getNumericValue(cpf.charAt(i))
                        * (tamanho + 1 - i);
            }

            int resto = (soma * 10) % 11;
            int digito = resto == 10 ? 0 : resto;

            if (digito != Character.getNumericValue(cpf.charAt(tamanho))) {
                return false;
            }
        }

        return true;
    }
}
