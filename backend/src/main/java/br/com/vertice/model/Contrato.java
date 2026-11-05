
package br.com.vertice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "contratos")
public class Contrato {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pedido_id", nullable = false, unique = true)
    private UUID pedidoId;

    @Column(name = "banco_agente_id")
    private UUID bancoAgenteId;

    @Column(nullable = false, unique = true)
    private String numero;

    @Column(name = "valor_credito")
    private BigDecimal valorCredito;

    @Column(nullable = false)
    private String status = "EM_EXECUCAO";

    @Column(name = "criado_em", insertable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "gerado_em", insertable = false, updatable = false)
    private OffsetDateTime geradoEm;

    public Contrato() {
    }

    public UUID getId() {
        return id;
    }

    public UUID getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(UUID pedidoId) {
        this.pedidoId = pedidoId;
    }

    public UUID getBancoAgenteId() {
        return bancoAgenteId;
    }

    public void setBancoAgenteId(UUID bancoAgenteId) {
        this.bancoAgenteId = bancoAgenteId;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public BigDecimal getValorCredito() {
        return valorCredito;
    }

    public void setValorCredito(BigDecimal valorCredito) {
        this.valorCredito = valorCredito;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public OffsetDateTime getGeradoEm() {
        return geradoEm;
    }
}
