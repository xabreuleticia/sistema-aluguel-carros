
package br.com.vertice.controller;

import br.com.vertice.dto.CriarPedidoRequest;
import br.com.vertice.model.Pedido;
import br.com.vertice.service.PedidoService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping("/meus")
    public List<Pedido> listarMeusPedidos(
            Authentication authentication
    ) {
        return pedidoService.listarMeusPedidos(authentication);
    }

    @GetMapping("/{id}")
    public Pedido buscarMeuPedido(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return pedidoService.buscarMeuPedido(id, authentication);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Pedido criar(
            @RequestBody CriarPedidoRequest dados,
            Authentication authentication
    ) {
        return pedidoService.criar(dados, authentication);
    }

    @PutMapping("/{id}")
    public Pedido editar(
            @PathVariable UUID id,
            @RequestBody CriarPedidoRequest dados,
            Authentication authentication
    ) {
        return pedidoService.editar(id, dados, authentication);
    }

    @PatchMapping("/{id}/cancelar")
    public Pedido cancelar(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        return pedidoService.cancelar(id, authentication);
    }
}
