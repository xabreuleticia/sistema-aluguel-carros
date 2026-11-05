
package br.com.vertice.repository;

import br.com.vertice.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ClienteRepository
        extends JpaRepository<Cliente, UUID> {

    Optional<Cliente> findByUsuarioId(UUID usuarioId);

    boolean existsByCpf(String cpf);
}
