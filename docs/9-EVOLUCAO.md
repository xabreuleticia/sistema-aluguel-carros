
# Evolução do Projeto — VÉRTICE

## 1. Introdução

Este documento apresenta a evolução do sistema VÉRTICE, desde a concepção de suas interfaces no Figma até a implementação funcional com React, Spring Boot e PostgreSQL.

A comparação utiliza como referência inicial sete telas exportadas do protótipo visual.

O objetivo é demonstrar como as interfaces planejadas foram transformadas em funcionalidades integradas a uma aplicação web.

## 2. Protótipo inicial

O protótipo inicial foi desenvolvido no Figma, utilizando uma identidade visual baseada em tons de verde-escuro, creme, tipografia elegante e imagens de automóveis.

As sete telas documentadas são:

1. Login.
2. Cadastro do cliente.
3. Frota.
4. Novo pedido.
5. Meus pedidos.
6. Painel do agente.
7. Pedido aprovado VT-2048.

Essas telas apresentam o planejamento visual e funcional da experiência de aluguel.

## 3. Comparação entre protótipo e implementação

### 3.1 Login

**Protótipo inicial:**

A tela apresenta uma composição dividida em duas áreas: imagem de destaque com identidade visual do VÉRTICE e formulário de autenticação.

O formulário inclui identificação do usuário, senha e opções relacionadas ao acesso à conta.

**Implementação final:**

A autenticação foi integrada ao back-end Spring Boot, utilizando Spring Security, sessões HTTP e controle de permissões.

O sistema passou a diferenciar os acessos de cliente, agente de empresa, agente bancário e administrador.

**Evolução identificada:** transformação de uma interface de autenticação planejada em um mecanismo funcional de acesso e autorização.

### 3.2 Cadastro do cliente

**Protótipo inicial:**

A tela organiza o cadastro em seções de identificação e acesso, endereço e atividade profissional e renda.

A seção profissional prevê o registro de vínculos empregatícios e rendimentos.

**Implementação final:**

O cadastro passou a persistir informações nas entidades Usuario, Cliente e Emprego.

A aplicação contempla validações e a restrição de até três vínculos empregatícios por cliente.

**Evolução identificada:** integração do formulário ao banco de dados e às regras de cadastro.

### 3.3 Frota

**Protótipo inicial:**

A tela apresenta uma vitrine de veículos, com banner, pesquisa, filtros, fotografias e cards contendo informações dos automóveis.

**Implementação final:**

O catálogo foi integrado aos dados de automóveis, permitindo consultas e verificações de disponibilidade.

**Evolução identificada:** substituição de uma vitrine planejada por uma interface conectada à API REST.

### 3.4 Novo pedido

**Protótipo inicial:**

A interface apresenta formulário de reserva, período de retirada e devolução, dados do contratante, condições de pagamento e resumo do veículo.

**Implementação final:**

O sistema permite registrar pedidos associados a clientes e automóveis, armazenando datas, valores e status.

As solicitações são processadas por serviços do back-end.

**Evolução identificada:** transformação do fluxo visual de reserva em um processo persistente de criação de pedidos.

### 3.5 Meus pedidos

**Protótipo inicial:**

A tela apresenta indicadores de solicitações, listagem de veículos, valores, períodos e diferentes situações dos pedidos.

**Implementação final:**

O cliente pode consultar seus pedidos e acompanhar os respectivos status.

A aplicação também contempla operações de alteração e cancelamento permitidas.

**Evolução identificada:** integração da listagem ao histórico real de solicitações.

### 3.6 Painel do agente

**Protótipo inicial:**

A interface apresenta indicadores de pedidos, fila de solicitações, dados do cliente, informações financeiras e área para registro de parecer.

**Implementação final:**

O painel de agentes foi integrado ao gerenciamento de solicitações.

A aplicação distingue responsabilidades de agentes de empresa e agentes bancários, permitindo análise financeira e decisões de crédito conforme o perfil.

**Evolução identificada:** especialização das operações e integração das decisões às regras de negócio.

### 3.7 Pedido aprovado

**Protótipo inicial:**

A tela apresenta uma visão de pedido aprovado, com etapas do processo, informações do automóvel, dados contratuais e resumo financeiro.

**Implementação final:**

O sistema passou a registrar contratos associados aos pedidos e disponibilizar documentos em PDF.

**Evolução identificada:** implementação da formalização contratual e da consulta aos documentos.

## 4. Funcionalidades adicionais da implementação

Além das sete telas do protótipo, a implementação analisada contempla:

- Separação de agentes de empresa e bancários.
- Painel administrativo.
- Gerenciamento de usuários e agentes.
- Autorização por perfil.
- Desativação de contas.
- Proteção CSRF.
- Integração com PostgreSQL/Supabase.
- Geração de contratos em PDF.

Essas funcionalidades ampliam o escopo funcional documentado pelas telas exportadas do Figma.

## 5. Evolução da arquitetura

O protótipo visual não representava uma implementação de back-end ou banco de dados.

A versão desenvolvida utiliza:

- React e Vite para interface.
- Java 25 e Spring Boot 4 para API REST.
- Spring Security para autenticação e autorização.
- Services para regras de negócio.
- Spring Data JPA para persistência.
- PostgreSQL/Supabase para armazenamento.

## 6. Relação com os modelos UML

O diagrama de casos de uso representa as funcionalidades dos quatro perfis.

O diagrama de classes apresenta as entidades Usuario, Cliente, Emprego, Automovel, Pedido e Contrato.

O diagrama de pacotes representa a organização lógica do front-end e back-end.

Esses modelos descrevem a implementação final.

O protótipo do Figma documenta a evolução da interface, mas não substitui eventuais versões iniciais dos diagramas UML produzidas durante a disciplina.

## 7. Evidências da evolução

Para apresentar visualmente a evolução, recomenda-se comparar:

| Protótipo Figma | Evidência da implementação |
|---|---|
| Login | Tela de login atual |
| Cadastro do cliente | Formulário atual |
| Frota | Catálogo atual |
| Novo pedido | Formulário de pedido atual |
| Meus pedidos | Página de pedidos atual |
| Painel do agente | Painel empresarial atual |
| Pedido aprovado | Página de contrato ou PDF atual |

As capturas devem utilizar a mesma funcionalidade nos dois estágios para facilitar a comparação.

## 8. Conclusão

A evolução do VÉRTICE demonstra a passagem de um protótipo visual para uma aplicação web com autenticação, persistência, gerenciamento de solicitações, análises financeiras e contratos.

O projeto mantém uma identidade visual planejada e incorpora regras de negócio e diferentes perfis de acesso.

A comparação entre o Figma e o sistema final evidencia a transformação das telas planejadas em funcionalidades implementadas.

A comparação histórica dos diagramas UML dependerá das versões iniciais efetivamente produzidas.
