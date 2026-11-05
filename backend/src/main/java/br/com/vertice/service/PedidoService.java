
package br.com.vertice.service;

import br.com.vertice.dto.CriarPedidoRequest;
import br.com.vertice.model.Automovel;
import br.com.vertice.model.Cliente;
import br.com.vertice.model.Pedido;
import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.PedidoRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final AutomovelRepository automovelRepository;

    public PedidoService(
            PedidoRepository pedidoRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository,
            AutomovelRepository automovelRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.automovelRepository = automovelRepository;
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarMeusPedidos(
            Authentication authentication
    ) {
        Cliente cliente = buscarClienteAutenticado(authentication);

        return pedidoRepository.findByClienteIdOrderByCriadoEmDesc(
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

        UUID usuarioId = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Usuário não encontrado."
                ))
                .getId();

        return clienteRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cadastro de cliente não encontrado."
                ));
    }

    private Pedido buscarPedidoDoCliente(
            UUID pedidoId,
            Cliente cliente
    ) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Solicitação não encontrada."
                ));

        if (!pedido.getClienteId().equals(cliente.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Você não possui acesso a esta solicitação."
            );
        }

        return pedido;
    }

    @Transactional(readOnly = true)
    public Pedido buscarMeuPedido(
            UUID pedidoId,
            Authentication authentication
    ) {
        Cliente cliente = buscarClienteAutenticado(authentication);
        return buscarPedidoDoCliente(pedidoId, cliente);
    }

    private Automovel validarAutomovelEPeriodo(
            CriarPedidoRequest dados
    ) {
        if (dados == null
                || dados.automovelId() == null
                || dados.dataInicio() == null
                || dados.dataFim() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Preencha os campos obrigatórios."
            );
        }

        if (dados.dataInicio().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A retirada não pode estar no passado."
            );
        }

        if (!dados.dataFim().isAfter(dados.dataInicio())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A devolução deve ser posterior à retirada."
            );
        }

        Automovel automovel = automovelRepository
                .findById(dados.automovelId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Automóvel não encontrado."
                ));

        if (!automovel.isDisponivel()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este automóvel não está disponível."
            );
        }

        boolean conflito = pedidoRepository.existeReservaConflitante(
                automovel.getId(),
                dados.dataInicio(),
                dados.dataFim()
        );

        if (conflito) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este automóvel já possui uma reserva aprovada "
                    + "para o período solicitado."
            );
        }

        if (automovel.getValorDiaria() == null
                || automovel.getValorDiaria()
                        .compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O automóvel não possui uma diária válida."
            );
        }

        return automovel;
    }

    private BigDecimal calcularValor(
            Automovel automovel,
            LocalDate inicio,
            LocalDate fim
    ) {
        long dias = ChronoUnit.DAYS.between(inicio, fim);

        return automovel.getValorDiaria().multiply(
                BigDecimal.valueOf(dias)
        );
    }

    @Transactional
    public Pedido criar(
            CriarPedidoRequest dados,
            Authentication authentication
    ) {
        Cliente cliente = buscarClienteAutenticado(authentication);
        Automovel automovel = validarAutomovelEPeriodo(dados);

        Pedido pedido = new Pedido();

        pedido.setClienteId(cliente.getId());
        pedido.setAutomovelId(automovel.getId());
        pedido.setDataInicio(dados.dataInicio());
        pedido.setDataFim(dados.dataFim());
        pedido.setValorTotal(calcularValor(
                automovel,
                dados.dataInicio(),
                dados.dataFim()
        ));
        pedido.setStatus("PENDENTE");

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido editar(
            UUID pedidoId,
            CriarPedidoRequest dados,
            Authentication authentication
    ) {
        Cliente cliente = buscarClienteAutenticado(authentication);
        Pedido pedido = buscarPedidoDoCliente(pedidoId, cliente);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Somente solicitações pendentes podem ser editadas."
            );
        }

        Automovel automovel = validarAutomovelEPeriodo(dados);

        pedido.setAutomovelId(automovel.getId());
        pedido.setDataInicio(dados.dataInicio());
        pedido.setDataFim(dados.dataFim());
        pedido.setValorTotal(calcularValor(
                automovel,
                dados.dataInicio(),
                dados.dataFim()
        ));

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido cancelar(
            UUID pedidoId,
            Authentication authentication
    ) {
        Cliente cliente = buscarClienteAutenticado(authentication);
        Pedido pedido = buscarPedidoDoCliente(pedidoId, cliente);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Somente solicitações pendentes podem ser canceladas."
            );
        }

        pedido.setStatus("CANCELADO");

        return pedidoRepository.save(pedido);
    }
}
