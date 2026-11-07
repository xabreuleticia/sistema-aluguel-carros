
# Especificação de Requisitos — VÉRTICE

## 1. Objetivo

Este documento descreve os requisitos funcionais e não funcionais do sistema VÉRTICE, considerando o enunciado do Laboratório 02 e a implementação desenvolvida.

## 2. Atores

| Ator | Descrição |
|---|---|
| Cliente | Usuário que solicita aluguel de veículos |
| Agente de empresa | Responsável pela análise e decisão empresarial |
| Agente bancário | Responsável pela avaliação de crédito |
| Administrador | Responsável pelo gerenciamento de contas |

## 3. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | Permitir cadastro de clientes | Alta |
| RF02 | Permitir login de usuários cadastrados | Alta |
| RF03 | Permitir logout | Alta |
| RF04 | Restringir funcionalidades conforme perfil | Alta |
| RF05 | Consultar automóveis disponíveis no catálogo | Alta |
| RF06 | Consultar disponibilidade de veículos por período | Alta |
| RF07 | Registrar pedidos de aluguel | Alta |
| RF08 | Consultar pedidos realizados | Alta |
| RF09 | Consultar status dos pedidos | Alta |
| RF10 | Modificar pedidos conforme regras de negócio | Alta |
| RF11 | Cancelar pedidos permitidos | Alta |
| RF12 | Consultar dados cadastrais do cliente | Alta |
| RF13 | Atualizar informações cadastrais | Alta |
| RF14 | Registrar dados pessoais e profissionais | Alta |
| RF15 | Registrar vínculos empregatícios e rendimentos | Alta |
| RF16 | Respeitar o limite de três empregos por cliente | Alta |
| RF17 | Permitir que agentes consultem pedidos | Alta |
| RF18 | Permitir análise financeira das solicitações | Alta |
| RF19 | Registrar parecer financeiro | Alta |
| RF20 | Aprovar ou recusar pedidos conforme critérios | Alta |
| RF21 | Encaminhar solicitações para análise bancária | Alta |
| RF22 | Permitir decisão de crédito por agente bancário | Alta |
| RF23 | Registrar contratos associados a pedidos | Alta |
| RF24 | Consultar contratos | Alta |
| RF25 | Gerar contratos em PDF | Média |
| RF26 | Registrar informações de automóveis | Alta |
| RF27 | Identificar o proprietário do automóvel | Alta |
| RF28 | Gerenciar a titularidade de veículos | Média |
| RF29 | Permitir desativação de contas | Média |
| RF30 | Permitir consulta administrativa de usuários | Média |
| RF31 | Permitir cadastro de agentes pelo administrador | Média |
| RF32 | Permitir gerenciamento administrativo de usuários | Média |

## 4. Requisitos não funcionais

| ID | Requisito | Tecnologia ou estratégia |
|---|---|---|
| RNF01 | O sistema deve funcionar pela Internet | Aplicação web cliente-servidor |
| RNF02 | O back-end deve utilizar Java 25 | JDK 25 |
| RNF03 | O back-end deve utilizar Spring Boot 4.0.x | Spring Boot 4.0.9 |
| RNF04 | O front-end deve utilizar React e Vite | React + Vite |
| RNF05 | O banco deve utilizar Supabase/PostgreSQL | PostgreSQL |
| RNF06 | O gerenciamento de dependências Java deve utilizar Maven | Maven Wrapper |
| RNF07 | A arquitetura deve separar responsabilidades | Controller, Service, Repository, Model |
| RNF08 | O sistema deve autenticar usuários | Spring Security |
| RNF09 | Senhas não devem ser armazenadas em texto simples | BCrypt |
| RNF10 | Funcionalidades restritas devem exigir autorização | Perfis e permissões |
| RNF11 | Os dados devem persistir entre execuções | Banco relacional |
| RNF12 | A comunicação entre front-end e back-end deve utilizar HTTP | API REST |
| RNF13 | Operações de alteração devem utilizar proteção CSRF | Spring Security |
| RNF14 | A interface deve oferecer navegação adequada em diferentes telas | Layout responsivo |
| RNF15 | O código e os modelos devem ser versionados | Git e GitHub |
| RNF16 | A documentação deve acompanhar as mudanças do sistema | Atualização dos modelos UML |

## 5. Regras de acesso

| Funcionalidade | Cliente | Empresa | Banco | Admin |
|---|---|---|---|---|
| Login | Sim | Sim | Sim | Sim |
| Criar pedido | Sim | Não | Não | Não |
| Consultar próprios pedidos | Sim | Não | Não | Não |
| Editar ou cancelar pedido próprio | Sim | Não | Não | Não |
| Analisar pedidos | Não | Sim | Não | Não |
| Registrar parecer financeiro | Não | Sim | Não | Não |
| Decidir crédito | Não | Não | Sim | Não |
| Gerenciar usuários | Não | Não | Não | Sim |
| Cadastrar agentes | Não | Não | Não | Sim |

Observação: a tabela descreve permissões funcionais por perfil, não necessariamente todos os endpoints públicos ou compartilhados.

## 6. Dados exigidos pelo domínio

### Cliente

- Nome
- CPF
- RG
- Endereço
- Profissão
- Empregadores
- Rendimentos

O sistema deve permitir no máximo três vínculos empregatícios por cliente.

### Automóvel

- Identificador
- Matrícula
- Ano
- Marca
- Modelo
- Placa
- Proprietário
- Disponibilidade

### Pedido

- Cliente
- Automóvel
- Data de início
- Data de término
- Valor
- Status
- Informações de análise financeira
- Informações de crédito, quando aplicáveis

### Contrato

- Identificador
- Pedido associado
- Número do contrato
- Situação
- Informações financeiras pertinentes

## 7. Rastreabilidade

| Grupo de requisitos | Implementação |
|---|---|
| RF01–RF04 | AuthController, CadastroService, LoginService, SecurityConfig |
| RF05–RF06 | AutomovelController, DisponibilidadeController |
| RF07–RF11 | PedidoController, PedidoService |
| RF12–RF16 | PerfilClienteController, PerfilClienteService, CadastroClienteRequest |
| RF17–RF20 | AgenteController, AgenteService |
| RF21–RF22 | BancoController, BancoService, AgenteService |
| RF23–RF25 | ContratoController, ContratoPdfService |
| RF26–RF28 | Automovel, ProprietarioAutomovelController |
| RF29 | DesativacaoContaController |
| RF30–RF32 | AdminController, AdminService |

## 8. Observações

Os requisitos descrevem o escopo funcional do projeto e os componentes associados.

A existência de uma implementação não substitui a execução de testes de aceitação. Os resultados devem ser registrados separadamente.

O CRUD de cliente inclui operações de cadastro, consulta e atualização, além de desativação lógica de conta. A desativação não equivale à exclusão física de registros.
