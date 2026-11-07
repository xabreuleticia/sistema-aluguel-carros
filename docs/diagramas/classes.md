# Diagrama de classes — modelo de domínio final

Os atributos abaixo foram extraídos das seis entidades JPA existentes em `backend/src/main/java/br/com/vertice/model/`. Os vínculos são **associações lógicas por UUID**, não necessariamente associações JPA com `@ManyToOne`.

```mermaid
classDiagram
  class Usuario {
    UUID id
    String nome
    String email
    String senhaHash
    String perfil
    String tipoAgente
    boolean ativo
    OffsetDateTime criadoEm
  }
  class Cliente {
    UUID id
    UUID usuarioId
    String cpf
    String rg
    String endereco
    String profissao
  }
  class Emprego {
    UUID id
    UUID clienteId
    String empresa
    BigDecimal rendimento
  }
  class Automovel {
    UUID id
    String matricula
    Integer ano
    String marca
    String modelo
    String placa
    String proprietarioTipo
    UUID proprietarioId
    boolean disponivel
    BigDecimal valorDiaria
  }
  class Pedido {
    UUID id
    UUID clienteId
    UUID automovelId
    LocalDate dataInicio
    LocalDate dataFim
    BigDecimal valorTotal
    String status
    String parecerFinanceiro
    String justificativaFinanceira
    UUID bancoAgenteId
    BigDecimal valorCredito
    String statusCredito
    String justificativaCredito
  }
  class Contrato {
    UUID id
    UUID pedidoId
    UUID bancoAgenteId
    String numero
    BigDecimal valorCredito
    String status
    OffsetDateTime criadoEm
    OffsetDateTime geradoEm
  }
  Usuario "1" --> "0..1" Cliente : usuarioId
  Cliente "1" --> "0..*" Emprego : clienteId
  Cliente "1" --> "0..*" Pedido : clienteId
  Automovel "1" --> "0..*" Pedido : automovelId
  Pedido "1" --> "0..1" Contrato : pedidoId
  Usuario "0..1" <-- "0..*" Pedido : bancoAgenteId
  Usuario "0..1" <-- "0..*" Contrato : bancoAgenteId
```

**Atenção:** cardinalidades representam a interpretação do domínio a partir das chaves e dos serviços. A regra do enunciado de **até três empregadores** deve ser validada nas regras efetivas de cadastro/edição; não é uma cardinalidade automaticamente imposta pelo diagrama.
