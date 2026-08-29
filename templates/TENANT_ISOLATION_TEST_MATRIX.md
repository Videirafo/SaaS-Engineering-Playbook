# Tenant Isolation Test Matrix

Use esta matriz para cada recurso crítico que pertença a um tenant.

| Cenário | Identidade | Tenant atual | Recurso | Resultado esperado |
|---|---|---|---|---|
| Owner acessa recurso próprio | autenticada | A | A | permitido |
| Membro autorizado acessa recurso próprio | autenticada | A | A | permitido conforme role |
| Role insuficiente | autenticada | A | A | 403/negação equivalente |
| Usuário A tenta recurso B | autenticada | A | B | 404/403 sem vazamento |
| Usuário sem membership | autenticada | A | A | negado |
| Não autenticado | ausente | — | A | 401 |
| `tenant_id` adulterado no request | autenticada | A | B | negado |
| ID previsível de outro tenant | autenticada | A | B | negado |
| Worker com contexto errado | service | A | B | falha segura |
| Cache com chave sem namespace | autenticada | A | B | teste deve detectar risco |

## Para cada teste registrar

- endpoint/ação;
- role;
- tenant da identidade;
- tenant do recurso;
- status/erro esperado;
- evidência de que nenhuma metadata sensível é retornada;
- ID do requisito/regra relacionado.

## Regras

1. Testar isolamento em **leitura e escrita**.
2. Testar APIs, jobs, exportações, busca, relatórios e storage.
3. Não confiar somente em filtros de frontend.
4. Testes negativos são obrigatórios para recursos de maior risco.
5. Quando houver RLS/policy no banco, manter testes também na camada de aplicação.