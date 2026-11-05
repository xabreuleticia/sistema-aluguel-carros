
package br.com.vertice.controller;

import br.com.vertice.model.Automovel;
import br.com.vertice.repository.AutomovelRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/automoveis")
public class AutomovelController {

    private final AutomovelRepository repository;

    public AutomovelController(AutomovelRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<Automovel> listarDisponiveis() {
        return repository
            .findByDisponivelTrueOrderByMarcaAscModeloAsc();
    }
}
