
# VÉRTICE — Sistema de Aluguel de Automóveis

## 1. Identificação

**Instituição:** Pontifícia Universidade Católica de Minas Gerais  
**Curso:** Engenharia de Software  
**Disciplina:** Desenvolvimento e Integração de Aplicações Web (DIAW)  
**Professor:** João Paulo Carneiro Aramuni  
**Atividade:** Laboratório 02 — Sistema de Aluguel de Carros  
**Projeto:** VÉRTICE  
**Ano:** 2026

**Aluna:** Letícia Xavier Abreu

**Repositório:** https://github.com/xabreuleticia/sistema-aluguel-carros.git

## 2. Introdução

O VÉRTICE é um sistema web desenvolvido para apoiar a gestão de aluguel de automóveis, permitindo que clientes realizem solicitações de aluguel pela Internet e acompanhem o andamento dos pedidos.

A plataforma integra clientes, agentes de empresas, agentes bancários e administradores em um ambiente centralizado.

O sistema contempla cadastro, autenticação, gerenciamento de pedidos, análise financeira, avaliação de crédito, formalização de contratos e administração de usuários.

## 3. Problema

O processo de aluguel de veículos pode envolver diferentes participantes, incluindo clientes, empresas proprietárias dos automóveis e instituições financeiras.

Sem uma plataforma integrada, a comunicação e o acompanhamento das solicitações podem se tornar complexos.

O VÉRTICE busca centralizar essas operações, permitindo maior organização das informações e acompanhamento das etapas do processo de aluguel.

## 4. Objetivos

### Objetivo geral

Desenvolver uma aplicação web para gerenciamento de solicitações de aluguel de automóveis, com autenticação, persistência de dados e diferentes perfis de acesso.

### Objetivos específicos

- Permitir cadastro e autenticação de clientes.
- Disponibilizar um catálogo de automóveis.
- Permitir consulta de disponibilidade.
- Registrar pedidos de aluguel.
- Permitir consulta, alteração e cancelamento de pedidos.
- Registrar dados pessoais, profissionais e financeiros dos clientes.
- Permitir avaliação financeira por agentes de empresas.
- Permitir análise de crédito por agentes bancários.
- Registrar decisões de aprovação e recusa.
- Gerenciar contratos de aluguel.
- Permitir consulta e geração de documentos contratuais em PDF.
- Disponibilizar administração de usuários e agentes.
- Aplicar regras de autenticação e autorização.

## 5. Perfis de usuário

### Cliente

Pode realizar cadastro, autenticar-se, consultar automóveis, registrar solicitações, acompanhar pedidos, editar informações permitidas e consultar contratos.

### Agente de empresa

Pode consultar solicitações, realizar análise financeira, registrar pareceres, aprovar ou recusar pedidos e gerenciar informações relacionadas à propriedade de veículos.

### Agente bancário

Pode consultar solicitações de crédito encaminhadas à instituição e registrar decisões de aprovação ou recusa.

### Administrador

Pode consultar usuários, cadastrar agentes e gerenciar perfis e situações de ativação das contas.

## 6. Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Linguagem do back-end | Java 25 |
| Framework do back-end | Spring Boot 4.0.9 |
| Segurança | Spring Security |
| Persistência | Spring Data JPA / Hibernate |
| Gerenciamento de dependências | Apache Maven |
| Front-end | React |
| Ferramenta de desenvolvimento | Vite |
| Navegação | React Router |
| Comunicação HTTP | Axios |
| Banco de dados | PostgreSQL |
| Hospedagem do banco | Supabase |
| Versionamento | Git e GitHub |

## 7. Arquitetura

O sistema utiliza arquitetura cliente-servidor.

O front-end React apresenta as interfaces e realiza requisições HTTP à API REST desenvolvida com Spring Boot.

O back-end está organizado em camadas:

- Controller: recebe requisições HTTP.
- Service: executa regras de negócio.
- Repository: realiza operações de persistência.
- Model: representa entidades do domínio.
- DTO: transporta dados de entrada.
- Config: configura segurança e inicialização.

O PostgreSQL, hospedado no Supabase, armazena os dados persistentes.

## 8. Modelo de domínio

As principais entidades do sistema são:

- Usuario
- Cliente
- Emprego
- Automovel
- Pedido
- Contrato

Os relacionamentos são implementados principalmente por identificadores UUID.

O modelo completo está documentado em `docs/04-CLASSES.md`.

## 9. Funcionalidades

### Autenticação e cadastro

- Cadastro de clientes.
- Login com e-mail e senha.
- Consulta da sessão autenticada.
- Logout.
- Controle de acesso por perfil.
- Desativação de contas.

### Gerenciamento de automóveis

- Listagem de automóveis.
- Consulta de disponibilidade.
- Consulta de períodos ocupados.
- Gerenciamento de titularidade por agentes autorizados.

### Gerenciamento de pedidos

- Criação de pedidos.
- Consulta de pedidos.
- Alteração de pedidos permitidos.
- Cancelamento.
- Acompanhamento do status.

### Análise financeira

- Consulta de solicitações.
- Avaliação de informações financeiras.
- Registro de parecer.
- Encaminhamento para análise bancária quando aplicável.
- Aprovação ou recusa empresarial.

### Crédito bancário

- Consulta de solicitações de crédito.
- Registro da decisão bancária.
- Atualização do status de crédito.

### Contratos

- Registro de contratos associados a pedidos.
- Consulta de contrato.
- Geração de documento PDF.

### Administração

- Consulta de usuários.
- Cadastro de agentes.
- Atualização de dados e permissões administrativas.
- Ativação e desativação de usuários.

## 10. Requisitos

Os requisitos funcionais e não funcionais estão descritos em:

`docs/01-REQUISITOS.md`

As histórias de usuário estão em:

`docs/02-HISTORIAS-DE-USUARIO.md`

## 11. Diagramas UML

A documentação contém:

- Diagrama de casos de uso.
- Diagrama de classes.
- Diagrama de pacotes.
- Descrição da arquitetura.
- Rastreabilidade e evolução do projeto.

Consulte os arquivos da pasta `docs/`.

## 12. Execução local

### Pré-requisitos

- Java JDK 25
- Node.js e npm compatíveis com a versão do Vite
- Acesso ao projeto PostgreSQL/Supabase
- Git
- Credenciais de ambiente configuradas

### Back-end

Abra o terminal na pasta `backend`.

No Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

A API será iniciada em:

`http://localhost:8080`

### Front-end

Abra outro terminal na pasta `frontend`.

```bash
npm install
npm run dev
```

A aplicação poderá ser acessada em:

`http://localhost:5173`

### Configuração do banco

Configure as variáveis de ambiente necessárias para a conexão com PostgreSQL.

As credenciais devem permanecer fora do controle de versão.

Nunca publique senhas ou chaves privadas no README.

## 13. Segurança

A aplicação utiliza:

- Autenticação com sessão HTTP.
- Senhas armazenadas por hash BCrypt.
- Spring Security.
- Controle de acesso por perfis.
- Proteção CSRF.
- Verificação de contas ativas.

O acesso às operações administrativas e financeiras depende das permissões do usuário autenticado.

## 14. Documentação complementar

| Documento | Conteúdo |
|---|---|
| 01-REQUISITOS.md | Requisitos funcionais e não funcionais |
| 02-HISTORIAS-DE-USUARIO.md | Histórias e critérios de aceitação |
| 03-CASOS-DE-USO.md | Casos de uso |
| 04-CLASSES.md | Modelo de classes |
| 05-PACOTES.md | Visão lógica |
| 06-ARQUITETURA.md | Organização e fluxos |
| 07-REGRAS-DE-NEGOCIO.md | Regras do domínio |
| 08-API.md | Endpoints REST |
| 09-EVOLUCAO.md | Rastreabilidade e evolução |
| 10-TESTES-E-APRESENTACAO.md | Validação e apresentação final |

## 15. Considerações finais

O VÉRTICE demonstra a integração de tecnologias de desenvolvimento web com uma aplicação baseada em regras de negócio, persistência relacional e autenticação.

O projeto contempla diferentes perfis de usuário e fluxos de solicitação, avaliação e formalização de aluguel de automóveis.

A documentação apresenta a modelagem e a organização da solução desenvolvida para o Laboratório 02.

## 16. Referências

- Documentação oficial do Spring Boot.
- Documentação oficial do React.
- Documentação oficial do Vite.
- Documentação oficial do PostgreSQL.
- Documentação oficial do Supabase.
- Material da disciplina DIAW — PUC Minas.
- Enunciado do Laboratório 02.
