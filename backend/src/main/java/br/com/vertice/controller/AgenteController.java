
package br.com.vertice.controller;

import br.com.vertice.model.Pedido;
import br.com.vertice.model.Usuario;

import br.com.vertice.repository.UsuarioRepository;
import br.com.vertice.service.AgenteService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agente")
public class AgenteController {

    private final AgenteService agenteService;
    private final UsuarioRepository usuarioRepository;

    public AgenteController(
            AgenteService agenteService,
            UsuarioRepository usuarioRepository
    ) {
        this.agenteService = agenteService;
        this.usuarioRepository = usuarioRepository;
    }

    // ==========================================
    // 1. LISTAR TODOS OS PEDIDOS DE ALUGUEL
    // ==========================================

    @GetMapping("/pedidos")
    public List<Pedido> listarPedidos() {
        return agenteService.listarTodos();
    }

    // ==========================================
    // 2. MODIFICAR PEDIDO PENDENTE
    // ==========================================

    @PutMapping("/pedidos/{id}")
    public Pedido modificarPedido(
            @PathVariable UUID id,
            @RequestBody AgenteService.ModificarPedidoRequest dados
    ) {
        return agenteService.modificarPedido(id, dados);
    }

    // ==========================================
    // 3. CONSULTAR ANÁLISE FINANCEIRA
    // ==========================================

    @GetMapping("/pedidos/{id}/analise-financeira")
    public AgenteService.AnaliseFinanceira consultarAnaliseFinanceira(
            @PathVariable UUID id
    ) {
        return agenteService.consultarAnaliseFinanceira(id);
    }

    // ==========================================
    // 4. REGISTRAR PARECER FINANCEIRO
    // ==========================================

    @PostMapping("/pedidos/{id}/parecer-financeiro")
    public Pedido registrarParecer(
            @PathVariable UUID id,
            @RequestBody AgenteService.RegistrarParecerRequest dados
    ) {
        return agenteService.registrarParecer(id, dados);
    }

    // ==========================================
    // 5. APROVAR PEDIDO
    // ==========================================

    @PatchMapping("/pedidos/{id}/aprovar")
    public Pedido aprovar(
            @PathVariable UUID id
    ) {
        return agenteService.aprovar(id);
    }

    // ==========================================
    // 6. RECUSAR PEDIDO
    // ==========================================

    @PatchMapping("/pedidos/{id}/recusar")
    public Pedido recusar(
            @PathVariable UUID id
    ) {
        return agenteService.recusar(id);
    }

    // ==========================================
    // 7. LISTAR AGENTES BANCÁRIOS ATIVOS
    // ==========================================

    public record BancoResumo(
            UUID id,
            String nome
    ) {}

    @GetMapping("/bancos")
    public List<BancoResumo> listarBancos() {

        List<Usuario> bancos = usuarioRepository
                .findByPerfilAndTipoAgenteAndAtivoTrueOrderByNomeAsc(
                        "AGENTE",
                        "BANCO"
                );

        return bancos.stream()
                .map(banco -> new BancoResumo(
                        banco.getId(),
                        banco.getNome()
                ))
                .toList();
    }
}
