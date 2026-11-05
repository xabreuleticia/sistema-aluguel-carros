
package br.com.vertice.repository;

import br.com.vertice.model.Automovel;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AutomovelRepository
        extends JpaRepository<Automovel, UUID> {

    // Lista os automóveis disponíveis,
    // organizados por marca e modelo.
    List<Automovel> findByDisponivelTrueOrderByMarcaAscModeloAsc();

    // Bloqueia temporariamente o registro do automóvel
    // enquanto uma reserva está sendo aprovada.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT a
        FROM Automovel a
        WHERE a.id = :id
    """)
    Optional<Automovel> buscarPorIdComBloqueio(
            @Param("id") UUID id
    );
}
