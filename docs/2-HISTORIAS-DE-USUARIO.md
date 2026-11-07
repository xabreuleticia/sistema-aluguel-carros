
# Histórias de Usuário — VÉRTICE

## 1. Objetivo

Representar os requisitos do sistema sob a perspectiva dos usuários, utilizando a estrutura:

**Como [ator], quero [funcionalidade], para [benefício].**

## 2. Histórias do cliente

### HU01 — Cadastro

Como visitante, quero criar uma conta de cliente, para utilizar os serviços de aluguel de automóveis.

Critérios de aceitação:
- O formulário deve receber os dados exigidos.
- O sistema deve validar o cadastro.
- O cadastro válido deve ser persistido.
- O e-mail deve identificar a conta.

### HU02 — Autenticação

Como usuário cadastrado, quero acessar minha conta, para utilizar funcionalidades autorizadas.

Critérios de aceitação:
- O login deve exigir credenciais.
- Credenciais inválidas devem ser recusadas.
- A sessão deve identificar o perfil do usuário.

### HU03 — Consulta de automóveis

Como cliente, quero visualizar os automóveis cadastrados, para escolher um veículo.

Critérios de aceitação:
- O sistema deve apresentar os veículos disponíveis para consulta.
- As informações devem permitir identificar cada automóvel.

### HU04 — Consulta de disponibilidade

Como cliente, quero verificar a disponibilidade de um veículo, para escolher um período adequado.

Critérios de aceitação:
- O sistema deve considerar o intervalo solicitado.
- Períodos ocupados devem ser considerados na consulta.

### HU05 — Solicitar aluguel

Como cliente, quero registrar um pedido de aluguel, para solicitar um veículo em determinado período.

Critérios de aceitação:
- O pedido deve identificar cliente e automóvel.
- Deve conter datas de início e término.
- Deve registrar valor e status.
- Uma solicitação válida deve ser persistida.

### HU06 — Acompanhar pedido

Como cliente, quero consultar meus pedidos, para acompanhar o andamento das solicitações.

Critérios de aceitação:
- O sistema deve listar os pedidos do cliente.
- Cada pedido deve apresentar seu status.
- O cliente não deve acessar pedidos de terceiros sem autorização.

### HU07 — Alterar pedido

Como cliente, quero modificar pedidos permitidos, para corrigir informações antes da conclusão da análise.

Critérios de aceitação:
- O sistema deve validar a situação do pedido.
- Alterações não permitidas devem ser recusadas.
- Alterações válidas devem ser persistidas.

### HU08 — Cancelar pedido

Como cliente, quero cancelar uma solicitação permitida, para desistir do aluguel.

Critérios de aceitação:
- O sistema deve verificar as regras de cancelamento.
- O pedido deve receber a situação correspondente.
- A alteração deve ficar registrada.

### HU09 — Atualizar perfil

Como cliente, quero consultar e atualizar meus dados, para manter as informações corretas.

Critérios de aceitação:
- Os dados existentes devem ser apresentados.
- Alterações válidas devem ser persistidas.
- Os dados profissionais devem respeitar as regras do sistema.

### HU10 — Registrar empregos

Como cliente, quero informar meus vínculos empregatícios e rendimentos, para permitir a avaliação financeira.

Critérios de aceitação:
- Cada vínculo deve identificar empregador e rendimento.
- O cliente pode informar no máximo três empregos.
- Os dados devem ser associados ao cliente correto.

### HU11 — Consultar contrato

Como cliente, quero consultar meu contrato de aluguel, para conhecer as condições registradas.

Critérios de aceitação:
- O contrato deve estar associado a um pedido.
- O acesso deve respeitar as permissões.
- O documento PDF deve ser disponibilizado quando aplicável.

## 3. Histórias do agente de empresa

### HU12 — Consultar solicitações

Como agente de empresa, quero visualizar pedidos de aluguel, para organizar a análise das solicitações.

Critérios de aceitação:
- O agente deve estar autenticado.
- O sistema deve apresentar pedidos autorizados para consulta.
- Os dados devem permitir identificar cada solicitação.

### HU13 — Análise financeira

Como agente de empresa, quero analisar informações financeiras do cliente, para avaliar sua capacidade de contratação.

Critérios de aceitação:
- O agente deve consultar os dados pertinentes.
- O sistema deve permitir registrar parecer.
- A decisão deve respeitar as regras do fluxo.

### HU14 — Decidir solicitação

Como agente de empresa, quero aprovar ou recusar pedidos, para dar continuidade ao processo de aluguel.

Critérios de aceitação:
- O sistema deve validar a situação do pedido.
- As decisões devem atualizar o registro.
- Aprovações devem respeitar as condições financeiras e bancárias aplicáveis.

### HU15 — Gerenciar propriedade

Como agente de empresa, quero atualizar informações de titularidade de veículos, para manter os registros de propriedade consistentes.

Critérios de aceitação:
- O automóvel deve existir.
- A operação deve exigir autorização.
- As alterações válidas devem ser persistidas.

## 4. Histórias do agente bancário

### HU16 — Consultar solicitações de crédito

Como agente bancário, quero visualizar solicitações de crédito, para avaliar os financiamentos associados aos aluguéis.

Critérios de aceitação:
- O acesso deve exigir perfil bancário.
- O sistema deve apresentar as solicitações pertinentes.

### HU17 — Decidir crédito

Como agente bancário, quero aprovar ou recusar uma solicitação de crédito, para registrar a decisão financeira.

Critérios de aceitação:
- A solicitação deve existir.
- A decisão deve respeitar o fluxo do sistema.
- O resultado deve ser persistido.

## 5. Histórias do administrador

### HU18 — Consultar usuários

Como administrador, quero consultar as contas cadastradas, para acompanhar os usuários do sistema.

Critérios de aceitação:
- O acesso deve exigir perfil administrativo.
- O sistema deve apresentar os usuários cadastrados.

### HU19 — Cadastrar agentes

Como administrador, quero cadastrar agentes de empresas e bancos, para disponibilizar os perfis responsáveis pelas análises.

Critérios de aceitação:
- O cadastro deve identificar o tipo de agente.
- Os dados devem ser validados.
- A conta deve receber as permissões correspondentes.

### HU20 — Gerenciar contas

Como administrador, quero alterar informações e situações de usuários, para administrar o acesso à plataforma.

Critérios de aceitação:
- Somente administradores autorizados devem executar a operação.
- Alterações devem respeitar as regras de segurança.
- Os dados devem ser persistidos.

## 6. Histórias de segurança

### HU21 — Encerrar sessão

Como usuário autenticado, quero sair do sistema, para encerrar minha sessão.

Critérios de aceitação:
- O logout deve invalidar a sessão.
- Operações protegidas devem exigir nova autenticação.

### HU22 — Proteção de acesso

Como responsável pelo sistema, quero restringir operações por perfil, para impedir acessos não autorizados.

Critérios de aceitação:
- Usuários sem permissão não devem executar operações restritas.
- Contas inativas devem ter o acesso bloqueado conforme a política de segurança.

## 7. Relação com os requisitos

As histórias HU01 a HU22 detalham os requisitos funcionais RF01 a RF32, organizados por ator e fluxo de negócio.

Os critérios de aceitação descrevem comportamentos esperados, e não constituem, isoladamente, evidência de testes executados.
