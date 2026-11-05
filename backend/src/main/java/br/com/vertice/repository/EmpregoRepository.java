
package br.com.vertice.repository;

import br.com.vertice.model.Emprego;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface EmpregoRepository
        extends JpaRepository<Emprego, UUID> {

    List<Emprego> findByClienteId(UUID clienteId);
}
