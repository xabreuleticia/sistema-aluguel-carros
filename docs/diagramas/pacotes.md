# Diagrama de pacotes — visão lógica final

```mermaid
flowchart TB
  UI["Frontend: React + Vite
pages / components / service / utils"]
  CTRL["backend: controller
REST API"]
  DTO["backend: dto
Requisições"]
  SERV["backend: service
Regras de negócio"]
  REPO["backend: repository
Spring Data JPA"]
  MODEL["backend: model
Entidades"]
  CONF["backend: config
Spring Security / filtros / bootstrap"]
  DB[("Supabase / PostgreSQL")]
  UI -->|HTTP /api| CTRL
  CTRL --> DTO
  CTRL --> SERV
  SERV --> REPO
  SERV --> MODEL
  REPO --> MODEL
  REPO --> DB
  CONF -.-> CTRL
```

## Responsabilidades

- `br.com.vertice.backend`: inicialização da aplicação e escaneamento de componentes.
- `br.com.vertice.config`: configuração de segurança, filtro de conta ativa e bootstrap administrativo.
- `br.com.vertice.controller`: rotas HTTP e entrada da aplicação.
- `br.com.vertice.dto`: contratos de dados de entrada.
- `br.com.vertice.service`: validação e regras de negócio.
- `br.com.vertice.repository`: consultas e persistência via JPA.
- `br.com.vertice.model`: entidades persistidas.
- `frontend/src/pages`, `components`, `service`, `utils`, `styles`: apresentação, navegação, comunicação com a API e estilo.

A organização é uma arquitetura em camadas com API REST; o front-end é uma aplicação separada, e não uma camada de templates MVC do Spring.
