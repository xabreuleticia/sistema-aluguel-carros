
package br.com.vertice.repository;

import br.com.vertice.model.Automovel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AutomovelRepository
        extends JpaRepository<Automovel, UUID> {

    List<Automovel> findByDisponivelTrueOrderByMarcaAscModeloAsc();
}
