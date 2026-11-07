
# Regras de Negócio — VÉRTICE

## 1. Objetivo

Documentar as restrições e condições relacionadas ao funcionamento do sistema de aluguel de automóveis.

## 2. Identificação dos usuários

**RN01:** operações protegidas exigem autenticação.

**RN02:** as permissões dependem do perfil do usuário.

**RN03:** agentes possuem especialização de empresa ou banco.

**RN04:** contas inativas não devem ter acesso autorizado.

**RN05:** senhas devem ser armazenadas de forma protegida.

## 3. Cadastro de clientes

**RN06:** clientes devem possuir cadastro associado a uma conta de usuário.

**RN07:** informações pessoais e profissionais devem ser registradas conforme os campos exigidos.

**RN08:** cada cliente pode informar no máximo três vínculos empregatícios.

**RN09:** os rendimentos informados compõem os dados utilizados na avaliação financeira.

## 4. Automóveis

**RN10:** cada automóvel deve possuir identificação própria.

**RN11:** os dados de automóveis incluem matrícula, ano, marca, modelo e placa.

**RN12:** o sistema deve registrar o tipo de proprietário do veículo.

**RN13:** a disponibilidade deve considerar as informações registradas sobre o veículo e seus períodos ocupados.

## 5. Pedidos de aluguel

**RN14:** pedidos devem estar associados a cliente e automóvel.

**RN15:** cada pedido deve conter período de aluguel.

**RN16:** o sistema deve registrar o valor do pedido.

**RN17:** pedidos novos são registrados com situação inicial `PENDENTE`.

**RN18:** alterações e cancelamentos dependem da situação do pedido e das validações implementadas.

**RN19:** o cliente deve consultar seus próprios pedidos.

## 6. Análise financeira

**RN20:** agentes de empresa são responsáveis pela análise financeira.

**RN21:** a análise pode registrar parecer `FAVORAVEL` ou `DESFAVORAVEL`.

**RN22:** o parecer deve ser associado ao pedido analisado.

**RN23:** a decisão empresarial deve considerar as condições exigidas pelo fluxo de análise.

## 7. Crédito bancário

**RN24:** pedidos podem envolver solicitação de crédito.

**RN25:** a solicitação pode ser associada a um agente bancário.

**RN26:** o crédito possui situação própria, independente do status geral do pedido.

**RN27:** decisões bancárias podem registrar `APROVADO` ou `RECUSADO`.

**RN28:** a aprovação empresarial deve respeitar a decisão de crédito quando esta for exigida.

## 8. Contratos

**RN29:** contratos devem estar associados a pedidos.

**RN30:** contratos podem registrar informações de crédito.

**RN31:** a aplicação permite consultar contratos e obter representação em PDF.

**RN32:** a criação do contrato deve respeitar o fluxo de aprovação implementado.

## 9. Administração

**RN33:** somente usuários autorizados podem acessar funções administrativas.

**RN34:** o administrador pode cadastrar agentes.

**RN35:** o administrador pode gerenciar dados e permissões de usuários conforme as regras do sistema.

**RN36:** a desativação de uma conta deve impedir novas operações autenticadas conforme a política de segurança.

## 10. Estados do processo

### Pedido

- PENDENTE
- APROVADO
- RECUSADO
- CANCELADO

### Parecer financeiro

- FAVORAVEL
- DESFAVORAVEL

### Crédito

- PENDENTE
- APROVADO
- RECUSADO

### Contrato

- EM_EXECUCAO

Esses são os estados identificados na implementação analisada. A documentação não pressupõe outros estados.

## 11. Observações

As regras apresentadas descrevem o comportamento de domínio identificado no código e os requisitos do laboratório.

Regras específicas de validação devem prevalecer sobre descrições gerais quando houver condições adicionais implementadas nos serviços.
