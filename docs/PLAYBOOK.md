# Playbook principal

## 1. Descoberta e requisitos

Antes da stack, definir:

- problema e usuário;
- fluxo principal;
- regras de negócio;
- dados sensíveis;
- integrações externas;
- volume e criticidade esperados;
- requisitos não funcionais.

Identificadores úteis:

```text
FR-###   requisito funcional
NFR-###  requisito não funcional
BR-###   regra de negócio
UC-###   caso de uso
API-###  contrato
ADR-###  decisão arquitetural
TEST-### cenário de teste
```

## 2. Arquitetura

Um SaaS deve deixar explícitas as fronteiras entre:

```text
Presentation
→ Application/API
→ Domain
→ Data
→ Integrations
→ Async processing
→ Observability
```

Evite colocar autorização, regras de negócio e efeitos externos diretamente na camada de UI.

## 3. Multi-tenancy

Perguntas obrigatórias:

1. como o tenant é identificado?
2. onde o `tenant_id` entra no contexto da requisição?
3. quem valida membership e role?
4. o banco reforça isolamento ou apenas a aplicação?
5. jobs assíncronos carregam contexto do tenant?
6. logs evitam expor dados entre clientes?
7. testes negativos comprovam isolamento?

## 4. AuthN e AuthZ

Separar conceitos:

- **Authentication**: quem é o usuário?
- **Authorization**: o que ele pode fazer?
- **Tenant membership**: em qual organização ele atua?
- **Resource ownership**: este recurso pertence ao contexto atual?

Fluxo recomendado:

```text
identity
→ session/token validation
→ tenant context
→ membership
→ role/policy
→ resource ownership
→ business action
```

## 5. Dados e migrations

Princípios:

- constraints para invariantes importantes;
- índices alinhados às consultas reais;
- migrations versionadas;
- mudanças destrutivas em etapas;
- backup antes de alterações de alto risco;
- estratégia de rollback/forward fix antes do deploy.

Para migrations incompatíveis, prefira **expand → migrate → contract**.

## 6. APIs

Contratos devem documentar:

- método e rota;
- autenticação;
- autorização;
- request/response;
- erros esperados;
- paginação;
- idempotência;
- rate limits quando relevantes;
- versionamento/depreciação.

OpenAPI é tratado como contrato, não como decoração.

## 7. Assíncrono e integrações

Para filas, webhooks e workers:

- idempotência;
- retry com limite;
- dead-letter strategy;
- correlation/request IDs;
- tenant context explícito;
- assinatura/verificação de webhooks;
- timeout e circuit breaking quando necessário.

## 8. Testes

Para fluxos críticos, cobrir no mínimo:

1. happy path;
2. validação;
3. não autenticado;
4. autenticado sem permissão;
5. tenant incorreto;
6. recurso inexistente;
7. falha de integração;
8. regressão de bugs corrigidos.

## 9. Segurança

Baseline:

- secrets fora do Git;
- menor privilégio;
- validação de entrada;
- proteção de sessão/token;
- headers/CORS coerentes;
- rate limiting conforme risco;
- audit log para ações críticas;
- dependency scanning;
- revisão de exposição pública de serviços.

## 10. Observabilidade

Um serviço de produção deve responder rapidamente:

- está saudável?
- qual versão está rodando?
- qual endpoint/worker falhou?
- qual tenant foi afetado sem expor dados?
- qual foi a latência?
- a taxa de erro aumentou?
- houve deploy próximo ao incidente?

Mínimo útil:

```text
logs estruturados
metrics
error tracking
request/correlation ids
deploy markers
health/readiness
alertas acionáveis
```

## 11. Deploy

Pipeline conceitual:

```text
lint
→ typecheck
→ unit tests
→ integration tests
→ security checks
→ build
→ migration validation
→ deploy
→ health check
→ smoke test
→ observability review
```

## 12. Operação e rollback

Antes de publicar:

- versão anterior identificada;
- rollback conhecido;
- compatibilidade de banco avaliada;
- backup disponível quando necessário;
- sinais objetivos de falha definidos.

## 13. Documentação como parte do sistema

Manter sincronizados:

```text
requirements
↕
architecture
↕
contracts
↕
implementation
↕
tests
↕
operations
```

Documentação divergente do código cria risco operacional.