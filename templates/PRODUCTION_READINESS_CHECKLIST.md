# Production Readiness Checklist

## Produto e escopo

- [ ] fluxo crítico definido
- [ ] critérios de aceite revisados
- [ ] riscos conhecidos documentados

## Segurança

- [ ] secrets fora do Git
- [ ] autenticação validada
- [ ] autorização server-side
- [ ] tenant isolation testado
- [ ] validação de entrada
- [ ] rate limiting quando necessário
- [ ] dependências revisadas

## Dados

- [ ] migrations revisadas
- [ ] índices necessários
- [ ] constraints importantes
- [ ] backup disponível
- [ ] restore conhecido/testável

## APIs e integrações

- [ ] contratos atualizados
- [ ] timeouts definidos
- [ ] retries limitados
- [ ] idempotência avaliada
- [ ] webhooks verificados

## Testes

- [ ] happy path
- [ ] validation errors
- [ ] 401/403
- [ ] tenant isolation
- [ ] not found
- [ ] integration failure
- [ ] regression tests

## Observabilidade

- [ ] health/readiness
- [ ] logs estruturados
- [ ] error tracking
- [ ] métricas críticas
- [ ] request/correlation IDs
- [ ] alertas acionáveis

## Deploy

- [ ] versão/commit identificável
- [ ] CI verde
- [ ] migration plan
- [ ] smoke test
- [ ] rollback conhecido
- [ ] responsável pela observação pós-deploy

## Pós-deploy

- [ ] health check verde
- [ ] erros dentro do esperado
- [ ] latência normal
- [ ] jobs/filas normais
- [ ] sem aumento inesperado de autenticação/autorização negada
- [ ] decisão: manter ou rollback