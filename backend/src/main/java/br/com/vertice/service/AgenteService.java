
package br.com.vertice.service;

import br.com.vertice.model.Automovel;
import br.com.vertice.model.Cliente;
import br.com.vertice.model.Contrato;
import br.com.vertice.model.Emprego;
import br.com.vertice.model.Pedido;
import br.com.vertice.model.Usuario;

import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.ContratoRepository;
import br.com.vertice.repository.EmpregoRepository;
import br.com.vertice.repository.PedidoRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class AgenteService {

    private final PedidoRepository pedidoRepository;
    private final AutomovelRepository automovelRepository;
    private final ContratoRepository contratoRepository;
    private final ClienteRepository clienteRepository;
    private final EmpregoRepository empregoRepository;
    private final UsuarioRepository usuarioRepository;

    public AgenteService(
            PedidoRepository pedidoRepository,
            AutomovelRepository automovelRepository,
            ContratoRepository contratoRepository,
            ClienteRepository clienteRepository,
            EmpregoRepository empregoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.pedidoRepository = pedidoRepository;
        this.automovelRepository = automovelRepository;
        this.contratoRepository = contratoRepository;
        this.clienteRepository = clienteRepository;
        this.empregoRepository = empregoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public record ModificarPedidoRequest(
            UUID automovelId,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {}

    public record EmpregoFinanceiro(
            String empresa,
            BigDecimal rendimento
    ) {}

    public record AnaliseFinanceira(
            UUID pedidoId,
            String profissao,
            BigDecimal valorPedido,
            BigDecimal rendaTotalInformada,
            List<EmpregoFinanceiro> empregos
    ) {}

    public record RegistrarParecerRequest(
            String parecer,
            String justificativa,
            UUID bancoAgenteId,
            BigDecimal valorCredito
    ) {}

    private Pedido buscarPedido(UUID id) {
        return pedidoRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Pedido não encontrado."
                        )
                );
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    @Transactional
    public Pedido modificarPedido(
            UUID pedidoId,
            ModificarPedidoRequest dados
    ) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Somente pedidos pendentes podem ser modificados."
            );
        }

        if (pedido.getParecerFinanceiro() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O pedido já possui parecer financeiro e não pode ser modificado."
            );
        }

        if (dados == null
                || dados.automovelId() == null
                || dados.dataInicio() == null
                || dados.dataFim() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o automóvel e as datas do aluguel."
            );
        }

        LocalDate inicio = dados.dataInicio();
        LocalDate fim = dados.dataFim();

        if (inicio.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A retirada não pode ocorrer no passado."
            );
        }

        if (!fim.isAfter(inicio)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A devolução deve ser posterior à retirada."
            );
        }

        Automovel automovel = automovelRepository
                .buscarPorIdComBloqueio(dados.automovelId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Automóvel não encontrado."
                        )
                );

        if (!automovel.isDisponivel()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O automóvel selecionado está indisponível."
            );
        }

        if (pedidoRepository.existeReservaConflitante(
                automovel.getId(),
                inicio,
                fim
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Já existe uma reserva aprovada para esse período."
            );
        }

        if (automovel.getValorDiaria() == null
                || automovel.getValorDiaria()
                        .compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "O automóvel não possui uma diária válida."
            );
        }

        long dias = ChronoUnit.DAYS.between(inicio, fim);

        BigDecimal valorTotal = automovel.getValorDiaria()
                .multiply(BigDecimal.valueOf(dias));

        pedido.setAutomovelId(automovel.getId());
        pedido.setDataInicio(inicio);
        pedido.setDataFim(fim);
        pedido.setValorTotal(valorTotal);

        return pedidoRepository.save(pedido);
    }

    @Transactional(readOnly = true)
    public AnaliseFinanceira consultarAnaliseFinanceira(
            UUID pedidoId
    ) {
        Pedido pedido = buscarPedido(pedidoId);

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

        List<EmpregoFinanceiro> detalhes = empregos.stream()
                .map(emprego -> new EmpregoFinanceiro(
                        emprego.getEmpresa(),
                        emprego.getRendimento()
                ))
                .toList();

        return new AnaliseFinanceira(
                pedido.getId(),
                cliente.getProfissao(),
                pedido.getValorTotal(),
                renda,
                detalhes
        );
    }

    @Transactional
    public Pedido registrarParecer(
            UUID pedidoId,
            RegistrarParecerRequest dados
    ) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Somente pedidos pendentes podem ser analisados."
            );
        }

        if (pedido.getParecerFinanceiro() != null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já possui parecer financeiro."
            );
        }

        if (dados == null
                || dados.parecer() == null
                || !List.of("FAVORAVEL", "DESFAVORAVEL")
                        .contains(dados.parecer())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe um parecer válido."
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

        UUID bancoId = dados.bancoAgenteId();
        BigDecimal credito = dados.valorCredito();

        if ("DESFAVORAVEL".equals(dados.parecer())) {
            if (bancoId != null || credito != null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Parecer desfavorável não pode conceder crédito."
                );
            }
        } else {
            if ((bancoId == null) != (credito == null)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Selecione o banco e informe o valor do crédito."
                );
            }

            if (credito != null) {
                if (credito.compareTo(BigDecimal.ZERO) <= 0
                        || credito.compareTo(pedido.getValorTotal()) > 0) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "O crédito deve ser positivo e não superar o valor do pedido."
                    );
                }

                Usuario banco = usuarioRepository.findById(bancoId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Banco não encontrado."
                                )
                        );

                if (!banco.isAtivo()
                        || !"AGENTE".equals(banco.getPerfil())
                        || !"BANCO".equals(banco.getTipoAgente())) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "O agente selecionado não é um banco ativo."
                    );
                }
            }
        }

        pedido.setParecerFinanceiro(dados.parecer());
        pedido.setJustificativaFinanceira(justificativa);
        pedido.setAnalisadoEm(OffsetDateTime.now());
        pedido.setBancoAgenteId(bancoId);
        pedido.setValorCredito(credito);

        pedido.setStatusCredito(
                bancoId == null ? null : "PENDENTE"
        );
        pedido.setJustificativaCredito(null);
        pedido.setCreditoAnalisadoEm(null);

        return pedidoRepository.save(pedido);
    }

    @Transactional
    public Pedido aprovar(UUID pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já foi analisado."
            );
        }

        if (!"FAVORAVEL".equals(pedido.getParecerFinanceiro())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "É necessário um parecer financeiro favorável."
            );
        }

        if (pedido.getBancoAgenteId() != null
                && !"APROVADO".equals(pedido.getStatusCredito())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "O financiamento precisa ser aprovado pelo banco antes da aprovação do aluguel."
            );
        }

        Automovel automovel = automovelRepository
                .buscarPorIdComBloqueio(pedido.getAutomovelId())
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Automóvel não encontrado."
                        )
                );

        if (!automovel.isDisponivel()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este automóvel está indisponível."
            );
        }

        if (pedidoRepository.existeReservaConflitante(
                pedido.getAutomovelId(),
                pedido.getDataInicio(),
                pedido.getDataFim()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Já existe uma reserva aprovada para esse período."
            );
        }

        if (contratoRepository.existsByPedidoId(pedidoId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já possui contrato."
            );
        }

        pedido.setStatus("APROVADO");
        Pedido aprovado = pedidoRepository.save(pedido);

        Contrato contrato = new Contrato();
        contrato.setPedidoId(aprovado.getId());
        contrato.setNumero("VERT-" + UUID.randomUUID());
        contrato.setStatus("EM_EXECUCAO");
        contrato.setBancoAgenteId(aprovado.getBancoAgenteId());
        contrato.setValorCredito(aprovado.getValorCredito());

        contratoRepository.save(contrato);

        return aprovado;
    }

    @Transactional
    public Pedido recusar(UUID pedidoId) {
        Pedido pedido = buscarPedido(pedidoId);

        if (!"PENDENTE".equals(pedido.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Este pedido já foi analisado."
            );
        }

        if (pedido.getBancoAgenteId() != null
                && "PENDENTE".equals(pedido.getStatusCredito())) {
            pedido.setStatusCredito("RECUSADO");
            pedido.setJustificativaCredito(
                    "Solicitação encerrada após recusa do aluguel pela empresa."
            );
            pedido.setCreditoAnalisadoEm(OffsetDateTime.now());
        }

        pedido.setStatus("RECUSADO");

        return pedidoRepository.save(pedido);
    }
}
