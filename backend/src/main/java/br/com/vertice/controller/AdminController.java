
package br.com.vertice.controller;

import br.com.vertice.service.AdminService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/usuarios")
    public List<AdminService.UsuarioResumo> listar() {
        return adminService.listar();
    }

    @PostMapping("/agentes")
    @ResponseStatus(HttpStatus.CREATED)
    public AdminService.UsuarioResumo criarAgente(
            @RequestBody AdminService.CriarAgenteRequest dados
    ) {
        return adminService.criarAgente(dados);
    }

    @PutMapping("/usuarios/{id}")
    public AdminService.UsuarioResumo atualizar(
            @PathVariable UUID id,
            @RequestBody AdminService.AtualizarUsuarioRequest dados,
            Authentication authentication
    ) {
        return adminService.atualizar(
                id,
                dados,
                authentication.getName()
        );
    }
}
