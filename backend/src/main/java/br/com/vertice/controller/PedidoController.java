
package br.com.vertice.controller;

import br.com.vertice.dto.CriarPedidoRequest;
import br.com.vertice.model.Pedido;
import br.com.vertice.service.PedidoService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Pedido criar(
        @RequestBody CriarPedidoRequest dados,
        Authentication authentication
    ) {
        return pedidoService.criar(dados, authentication);
    }
}
