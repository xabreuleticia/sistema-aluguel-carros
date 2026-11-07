# Diagrama de casos de uso — versão final

O diagrama abaixo é uma **visão funcional simplificada**, derivada dos endpoints e das páginas do projeto. Para uma notação UML estrita, use também o arquivo PlantUML `casos-de-uso.puml`.

```mermaid
flowchart LR
  C[Cliente] --> UC1((Cadastrar e autenticar))
  C --> UC2((Consultar veículos))
  C --> UC3((Gerenciar pedidos))
  C --> UC4((Atualizar perfil))
  C --> UC5((Consultar contrato / PDF))
  E[Agente de empresa] --> UC6((Analisar pedidos))
  E --> UC7((Emitir parecer))
  E --> UC8((Aprovar / recusar))
  E --> UC9((Gerenciar propriedade))
  B[Agente bancário] --> UC10((Avaliar crédito))
  A[Administrador] --> UC11((Gerenciar usuários))
  A --> UC12((Cadastrar agentes))
  E --> UC1
  B --> UC1
  A --> UC1
```

**Fonte:** `AuthController`, `PedidoController`, `AgenteController`, `BancoController`, `AdminController`, `ContratoController`, `PerfilClienteController`, `AutomovelController` e `ProprietarioAutomovelController`.
