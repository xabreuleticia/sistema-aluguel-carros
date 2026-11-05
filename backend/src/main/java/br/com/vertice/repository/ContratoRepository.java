
package br.com.vertice.repository;

import br.com.vertice.model.Contrato;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ContratoRepository
        extends JpaRepository<Contrato, UUID> {

    Optional<Contrato> findByPedidoId(UUID pedidoId);

    boolean existsByPedidoId(UUID pedidoId);
}
