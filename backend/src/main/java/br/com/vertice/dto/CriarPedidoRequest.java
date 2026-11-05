
package br.com.vertice.dto;

import java.time.LocalDate;
import java.util.UUID;

public record CriarPedidoRequest(
    UUID automovelId,
    LocalDate dataInicio,
    LocalDate dataFim
) {
}
