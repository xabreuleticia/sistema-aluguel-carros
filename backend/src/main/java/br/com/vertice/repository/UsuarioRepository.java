
package br.com.vertice.repository;

import br.com.vertice.model.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository
        extends JpaRepository<Usuario, UUID> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByPerfilAndTipoAgenteAndAtivoTrueOrderByNomeAsc(
            String perfil,
            String tipoAgente
    );

    long countByPerfilAndAtivoTrue(
            String perfil
    );
}
