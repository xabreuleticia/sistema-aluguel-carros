
package br.com.vertice.repository;

import br.com.vertice.model.Pedido;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PedidoRepository
        extends JpaRepository<Pedido, UUID> {

    List<Pedido> findByClienteIdOrderByCriadoEmDesc(
            UUID clienteId
    );

    boolean existsByClienteIdAndStatusNotIn(
            UUID clienteId,
            List<String> statusFinalizados
    );

    @Query("""
        SELECT CASE WHEN COUNT(p) > 0
            THEN true
            ELSE false
        END
        FROM Pedido p
        WHERE p.automovelId = :automovelId
          AND p.status = 'APROVADO'
          AND p.dataInicio < :dataFim
          AND p.dataFim > :dataInicio
    """)
    boolean existeReservaConflitante(
            @Param("automovelId") UUID automovelId,
            @Param("dataInicio") LocalDate dataInicio,
            @Param("dataFim") LocalDate dataFim
    );
}
