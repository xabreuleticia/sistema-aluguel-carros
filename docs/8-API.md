
# Documentação da API REST — VÉRTICE

## 1. Informações gerais

**Back-end:** Spring Boot  
**Porta local:** 8080  
**Endereço base:** http://localhost:8080  
**Formato principal:** JSON  
**Autenticação:** sessão HTTP  
**Segurança:** Spring Security e CSRF

## 2. Autenticação

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/auth/csrf | Obter token CSRF |
| POST | /api/auth/cadastro | Cadastrar cliente |
| POST | /api/auth/login | Autenticar usuário |
| GET | /api/auth/me | Consultar sessão |
| POST | /api/auth/logout | Encerrar sessão |

## 3. Automóveis

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/automoveis | Listar automóveis |
| GET | /api/automoveis/disponibilidade | Consultar disponibilidade |
| GET | /api/automoveis/{automovelId}/periodos-ocupados | Consultar períodos ocupados |

## 4. Pedidos do cliente

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/pedidos/meus | Listar pedidos próprios |
| GET | /api/pedidos/{id} | Consultar pedido |
| POST | /api/pedidos | Criar pedido |
| PUT | /api/pedidos/{id} | Atualizar pedido |
| PATCH | /api/pedidos/{id}/cancelar | Cancelar pedido |

## 5. Perfil do cliente

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/perfil | Consultar perfil |
| PUT | /api/perfil | Atualizar perfil |
| POST | /api/perfil/desativar | Desativar conta |

## 6. Agente de empresa

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/agente/pedidos | Consultar pedidos |
| PUT | /api/agente/pedidos/{id} | Atualizar pedido |
| GET | /api/agente/pedidos/{id}/analise-financeira | Consultar análise |
| POST | /api/agente/pedidos/{id}/parecer-financeiro | Registrar parecer |
| PATCH | /api/agente/pedidos/{id}/aprovar | Aprovar pedido |
| PATCH | /api/agente/pedidos/{id}/recusar | Recusar pedido |
| GET | /api/agente/bancos | Consultar bancos |
| GET | /api/agente/automoveis | Consultar automóveis |
| PUT | /api/agente/automoveis/{automovelId}/proprietario | Atualizar proprietário |

## 7. Agente bancário

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/banco/solicitacoes | Consultar solicitações |
| PATCH | /api/banco/solicitacoes/{id}/decisao | Registrar decisão |

## 8. Contratos

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/contratos/pedido/{pedidoId} | Consultar contrato |
| GET | /api/contratos/pedido/{pedidoId}/pdf | Obter PDF |

## 9. Administração

| Método | Endpoint | Finalidade |
|---|---|---|
| GET | /api/admin/usuarios | Consultar usuários |
| POST | /api/admin/agentes | Cadastrar agente |
| PUT | /api/admin/usuarios/{id} | Atualizar usuário |

## 10. Segurança

O sistema aplica autenticação e autorização conforme as regras configuradas no Spring Security.

Os endpoints de negócio exigem permissões adequadas.

As requisições que modificam dados devem respeitar a política de proteção CSRF.

## 11. Códigos HTTP

Os códigos HTTP indicam o resultado das operações.

Exemplos de respostas possíveis:

- 200 OK: operação concluída.
- 201 Created: recurso criado.
- 400 Bad Request: requisição inválida.
- 401 Unauthorized: autenticação necessária ou inválida.
- 403 Forbidden: acesso não autorizado.
- 404 Not Found: recurso não encontrado.

A resposta efetiva depende do endpoint, das validações e dos tratamentos de exceção implementados.

## 12. Observações

Esta documentação descreve os endpoints identificados nos controllers.

Os corpos JSON completos, parâmetros obrigatórios e códigos específicos devem ser consultados nas assinaturas dos métodos Java e nos DTOs correspondentes.

Este documento não substitui uma especificação OpenAPI.
