
package br.com.vertice.controller;

import br.com.vertice.model.Pedido;
import br.com.vertice.service.AgenteService;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agente")
public class AgenteController {

    private final AgenteService agenteService;

    public AgenteController(AgenteService agenteService) {
        this.agenteService = agenteService;
    }

    @GetMapping("/pedidos")
    public List<Pedido> listarPedidos() {
        return agenteService.listarTodos();
    }

    @GetMapping("/pedidos/{id}/analise-financeira")
    public AgenteService.AnaliseFinanceira consultarAnaliseFinanceira(
            @PathVariable UUID id
    ) {
        return agenteService.consultarAnaliseFinanceira(id);
    }

    @PostMapping("/pedidos/{id}/parecer-financeiro")
    public Pedido registrarParecer(
            @PathVariable UUID id,
            @RequestBody AgenteService.RegistrarParecerRequest dados
    ) {
        return agenteService.registrarParecer(id, dados);
    }

    @PatchMapping("/pedidos/{id}/aprovar")
    public Pedido aprovar(@PathVariable UUID id) {
        return agenteService.aprovar(id);
    }

    @PatchMapping("/pedidos/{id}/recusar")
    public Pedido recusar(@PathVariable UUID id) {
        return agenteService.recusar(id);
    }
}
