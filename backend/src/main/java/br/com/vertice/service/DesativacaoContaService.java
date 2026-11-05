
package br.com.vertice.service;

import br.com.vertice.model.Cliente;
import br.com.vertice.model.Usuario;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.PedidoRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DesativacaoContaService {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final PedidoRepository pedidoRepository;
    private final PasswordEncoder passwordEncoder;

    public DesativacaoContaService(
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            PedidoRepository pedidoRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.pedidoRepository = pedidoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void desativar(
            String senha,
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Faça login para continuar."
            );
        }

        Usuario usuario = usuarioRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário não encontrado."
                ));

        if (!"CLIENTE".equals(usuario.getPerfil())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta operação é exclusiva para clientes."
            );
        }

        if (!usuario.isAtivo()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta conta já está desativada."
            );
        }

        if (senha == null
                || !passwordEncoder.matches(
                        senha,
                        usuario.getSenhaHash()
                )) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Senha incorreta."
            );
        }

        Cliente cliente = clienteRepository
                .findByUsuarioId(usuario.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cadastro de cliente não encontrado."
                ));

        boolean possuiPedidosNaoFinalizados =
                pedidoRepository.existsByClienteIdAndStatusNotIn(
                        cliente.getId(),
                        List.of("CANCELADO", "RECUSADO")
                );

        if (possuiPedidosNaoFinalizados) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é possível desativar a conta enquanto "
                    + "existirem pedidos não finalizados."
            );
        }

        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
}
