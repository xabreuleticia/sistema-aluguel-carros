
package br.com.vertice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "cliente_id", nullable = false)
    private UUID clienteId;

    @Column(name = "automovel_id", nullable = false)
    private UUID automovelId;

    @Column(name = "data_inicio", nullable = false)
    private LocalDate dataInicio;

    @Column(name = "data_fim", nullable = false)
    private LocalDate dataFim;

    @Column(name = "valor_total", nullable = false)
    private BigDecimal valorTotal;

    @Column(nullable = false)
    private String status = "PENDENTE";

    @Column(name = "parecer_financeiro")
    private String parecerFinanceiro;

    @Column(name = "justificativa_financeira")
    private String justificativaFinanceira;

    @Column(name = "analisado_em")
    private OffsetDateTime analisadoEm;

    @Column(name = "banco_agente_id")
    private UUID bancoAgenteId;

    @Column(name = "valor_credito")
    private BigDecimal valorCredito;

    @Column(name = "status_credito")
    private String statusCredito;

    @Column(name = "justificativa_credito")
    private String justificativaCredito;

    @Column(name = "credito_analisado_em")
    private OffsetDateTime creditoAnalisadoEm;

    @Column(
        name = "criado_em",
        insertable = false,
        updatable = false
    )
    private OffsetDateTime criadoEm;

    public Pedido() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getClienteId() {
        return clienteId;
    }

    public void setClienteId(UUID clienteId) {
        this.clienteId = clienteId;
    }

    public UUID getAutomovelId() {
        return automovelId;
    }

    public void setAutomovelId(UUID automovelId) {
        this.automovelId = automovelId;
    }

    public LocalDate getDataInicio() {
        return dataInicio;
    }

    public void setDataInicio(LocalDate dataInicio) {
        this.dataInicio = dataInicio;
    }

    public LocalDate getDataFim() {
        return dataFim;
    }

    public void setDataFim(LocalDate dataFim) {
        this.dataFim = dataFim;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(BigDecimal valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getParecerFinanceiro() {
        return parecerFinanceiro;
    }

    public void setParecerFinanceiro(
            String parecerFinanceiro
    ) {
        this.parecerFinanceiro = parecerFinanceiro;
    }

    public String getJustificativaFinanceira() {
        return justificativaFinanceira;
    }

    public void setJustificativaFinanceira(
            String justificativaFinanceira
    ) {
        this.justificativaFinanceira =
                justificativaFinanceira;
    }

    public OffsetDateTime getAnalisadoEm() {
        return analisadoEm;
    }

    public void setAnalisadoEm(
            OffsetDateTime analisadoEm
    ) {
        this.analisadoEm = analisadoEm;
    }

    public UUID getBancoAgenteId() {
        return bancoAgenteId;
    }

    public void setBancoAgenteId(
            UUID bancoAgenteId
    ) {
        this.bancoAgenteId = bancoAgenteId;
    }

    public BigDecimal getValorCredito() {
        return valorCredito;
    }

    public void setValorCredito(
            BigDecimal valorCredito
    ) {
        this.valorCredito = valorCredito;
    }

    public String getStatusCredito() {
        return statusCredito;
    }

    public void setStatusCredito(
            String statusCredito
    ) {
        this.statusCredito = statusCredito;
    }

    public String getJustificativaCredito() {
        return justificativaCredito;
    }

    public void setJustificativaCredito(
            String justificativaCredito
    ) {
        this.justificativaCredito =
                justificativaCredito;
    }

    public OffsetDateTime getCreditoAnalisadoEm() {
        return creditoAnalisadoEm;
    }

    public void setCreditoAnalisadoEm(
            OffsetDateTime creditoAnalisadoEm
    ) {
        this.creditoAnalisadoEm =
                creditoAnalisadoEm;
    }

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }
}
