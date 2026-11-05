
package br.com.vertice.service;

import br.com.vertice.model.Cliente;
import br.com.vertice.model.Pedido;

import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.PedidoRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<Pedido> listarMeusPedidos(
            Authentication authentication
    ) {
        Cliente cliente = buscarClienteAutenticado(
            authentication
        );

        return pedidoRepository
            .findByClienteIdOrderByCriadoEmDesc(
                cliente.getId()
            );
    }

    private Cliente buscarClienteAutenticado(
            Authentication authentication
    ) {
        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Faça login para continuar."
            );
        }

        String email = authentication.getName();

        UUID usuarioId = usuarioRepository
            .findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Usuário não encontrado."
            ))
            .getId();

        return clienteRepository
            .findByUsuarioId(usuarioId)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Cadastro de cliente não encontrado."
            ));
    }

    public Pedido criar(
            Pedido pedido,
            Authentication authentication
    ) {
        Cliente cliente = buscarClienteAutenticado(
            authentication
        );

        // O cliente é identificado pela sessão,
        // nunca pelo ID enviado pelo navegador.
        pedido.setClienteId(cliente.getId());

        validar(pedido);

        long dias = ChronoUnit.DAYS.between(
            pedido.getDataInicio(),
            pedido.getDataFim()
        );

        pedido.setValorTotal(
            pedido.getValorDiaria().multiply(
                BigDecimal.valueOf(dias)
            )
        );

        pedido.setStatus("PENDENTE");

        return pedidoRepository.save(pedido);
    }

    private void validar(Pedido pedido) {
        if (pedido.getAutomovelId() == null
                || pedido.getDataInicio() == null
                || pedido.getDataFim() == null
                || pedido.getValorDiaria() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Preencha todos os campos obrigatórios."
            );
        }

        if (pedido.getDataInicio().isBefore(
                LocalDate.now())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A retirada não pode ser no passado."
            );
        }

        if (!pedido.getDataFim().isAfter(
                pedido.getDataInicio())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "A devolução deve ser posterior à retirada."
            );
        }

        if (pedido.getValorDiaria().compareTo(
                BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "O valor da diária deve ser positivo."
            );
        }
    }
}
