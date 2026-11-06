
package br.com.vertice.controller;

import br.com.vertice.model.Automovel;
import br.com.vertice.model.Usuario;
import br.com.vertice.repository.AutomovelRepository;
import br.com.vertice.repository.ClienteRepository;
import br.com.vertice.repository.UsuarioRepository;

import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agente/automoveis")
public class ProprietarioAutomovelController {

    private final AutomovelRepository automovelRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;

    public ProprietarioAutomovelController(
            AutomovelRepository automovelRepository,
            ClienteRepository clienteRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.automovelRepository = automovelRepository;
        this.clienteRepository = clienteRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public record ProprietarioRequest(
            String tipo,
            UUID proprietarioId
    ) {}

    public record ProprietarioResponse(
            UUID automovelId,
            String automovel,
            String proprietarioTipo,
            UUID proprietarioId
    ) {}

    @GetMapping
    @Transactional(readOnly = true)
    public List<ProprietarioResponse> listar() {
        return automovelRepository.findAll().stream()
                .map(this::converter)
                .toList();
    }

    @PutMapping("/{automovelId}/proprietario")
    @Transactional
    public ProprietarioResponse atualizar(
            @PathVariable UUID automovelId,
            @RequestBody ProprietarioRequest dados
    ) {
        Automovel automovel = automovelRepository
                .findById(automovelId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Automóvel não encontrado."
                ));

        if (dados == null
                || dados.tipo() == null
                || dados.proprietarioId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Informe o tipo e o proprietário."
            );
        }

        String tipo = dados.tipo().trim().toUpperCase();

        switch (tipo) {
            case "CLIENTE" -> {
                if (!clienteRepository.existsById(
                        dados.proprietarioId()
                )) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Cliente proprietário não encontrado."
                    );
                }
            }

            case "EMPRESA", "BANCO" -> {
                Usuario usuario = usuarioRepository
                        .findById(dados.proprietarioId())
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.BAD_REQUEST,
                                        "Agente proprietário não encontrado."
                                )
                        );

                if (!usuario.isAtivo()
                        || !"AGENTE".equals(usuario.getPerfil())
                        || !tipo.equals(usuario.getTipoAgente())) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "O proprietário não corresponde ao tipo informado."
                    );
                }
            }

            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tipo inválido. Use CLIENTE, EMPRESA ou BANCO."
            );
        }

        automovel.setProprietarioTipo(tipo);
        automovel.setProprietarioId(dados.proprietarioId());

        return converter(automovelRepository.save(automovel));
    }

    private ProprietarioResponse converter(Automovel automovel) {
        return new ProprietarioResponse(
                automovel.getId(),
                automovel.getMarca() + " " + automovel.getModelo(),
                automovel.getProprietarioTipo(),
                automovel.getProprietarioId()
        );
    }
}
