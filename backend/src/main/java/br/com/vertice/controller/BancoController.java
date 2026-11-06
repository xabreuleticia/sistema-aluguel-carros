
package br.com.vertice.controller;

import br.com.vertice.model.Usuario;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agente/bancos")
public class BancoController {

    private final UsuarioRepository usuarioRepository;

    public BancoController(
            UsuarioRepository usuarioRepository
    ) {
        this.usuarioRepository = usuarioRepository;
    }

    public record BancoResponse(
            UUID id,
            String nome
    ) {}

    @GetMapping
    public List<BancoResponse> listarBancos() {
        return usuarioRepository
                .findByPerfilAndTipoAgenteAndAtivoTrueOrderByNomeAsc(
                        "AGENTE",
                        "BANCO"
                )
                .stream()
                .map(usuario -> new BancoResponse(
                        usuario.getId(),
                        usuario.getNome()
                ))
                .toList();
    }
}
