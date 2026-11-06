
package br.com.vertice.service;

import br.com.vertice.model.Cliente;
import br.com.vertice.model.Emprego;
import br.com.vertice.model.Pedido;
import br.com.vertice.model.Usuario;

import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.EmpregoRepository;
import br.com.vertice.repository.PedidoRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BancoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final EmpregoRepository empregoRepository;

    public BancoService(
            PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            EmpregoRepository empregoRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.empregoRepository = empregoRepository;
    }

    public record DecisaoCreditoRequest(
            String decisao,
            String justificativa
    ) {}

    public record EmpregoResumo(
            String empresa,
            BigDecimal rendimento
    ) {}

    public record SolicitacaoCredito(
            UUID id,
            UUID clienteId,
            UUID automovelId,
            String statusPedido,
            String statusCredito,
            BigDecimal valorTotal,
            BigDecimal valorCredito,
            String profissao,
            BigDecimal rendaInformada,
            List<EmpregoResumo> empregos,
            String justificativaCredito,
            OffsetDateTime creditoAnalisadoEm,
            OffsetDateTime criadoEm
    ) {}

    private Usuario bancoAutenticado(String email) {
        Usuario usuario = usuarioRepository.findAll()
                .stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst()
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "Usuário não encontrado."
                        )
                );

        if (!usuario.isAtivo()
                || !"AGENTE".equals(usuario.getPerfil())
                || !"BANCO".equals(usuario.getTipoAgente())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Acesso exclusivo de agentes bancários."
            );
        }

        return usuario;
    }

    private SolicitacaoCredito montarResposta(Pedido pedido) {
        Cliente cliente = clienteRepository
                .findById(pedido.getClienteId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Cliente não encontrado."
                        )
                );

        List<Emprego> empregos =
                empregoRepository.findByClienteId(cliente.getId());

        BigDecimal renda = empregos.stream()
                .map(Emprego::getRendimento)
                .filter(valor -> valor != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<EmpregoResumo> detalhes = empregos.stream()
                .map(emprego -> new EmpregoResumo(
                        emprego.getEmpresa(),
                        emprego.getRendimento()
                ))
                .toList();

        return new SolicitacaoCredito(
                pedido.getId(),
                pedido.getClienteId(),
                pedido.getAutomovelId(),
                pedido.getStatus(),
                pedido.getStatusCredito(),
                pedido.getValorTotal(),
                pedido.getValorCredito(),
                cliente.getProfissao(),
                renda,
                detalhes,
                pedido.getJustificativaCredito(),
                pedido.getCreditoAnalisadoEm(),
                pedido.getCriadoEm()
        );
    }

    @Transactional(readOnly = true)
    public List<SolicitacaoCredito> listar(String email) {
        Usuario banco = bancoAutenticado(email);

        return pedidoRepository
                .findByBancoAgenteIdOrderByCriadoEmDesc(
                        banco.getId()
                )
                .stream()
                .map(this::montarResposta)
                .toList();
    }

    @Transactional
    public SolicitacaoCredito decidir(
            String email,
            UUID pedidoId,
            DecisaoCreditoRequest dados
    ) {
        Usuario banco = bancoAutenticado(email);

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Solicitação não encontrada."
                        )
                );

        if (!banco.getId().equals(pedido.getBancoAgenteId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Esta solicitação pertence a outro banco."
            );
        }

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O pedido de aluguel não está pendente."
            );
        }

        if (!"PENDENTE".equals(pedido.getStatusCredito())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esta solicitação de crédito já foi analisada."
            );
        }

        if (pedido.getValorCredito() == null
                || pedido.getValorCredito()
                        .compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O pedido não possui crédito válido."
            );
        }

        if (dados == null
                || dados.decisao() == null
                || !List.of("APROVADO", "RECUSADO")
                        .contains(dados.decisao())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe APROVADO ou RECUSADO."
            );
        }

        String justificativa = dados.justificativa() == null
                ? ""
                : dados.justificativa().trim();

        if (justificativa.isBlank()
                || justificativa.length() > 2000) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A justificativa deve ter entre 1 e 2000 caracteres."
            );
        }

        pedido.setStatusCredito(dados.decisao());
        pedido.setJustificativaCredito(justificativa);
        pedido.setCreditoAnalisadoEm(OffsetDateTime.now());

        Pedido atualizado = pedidoRepository.save(pedido);

        return montarResposta(atualizado);
    }
}
