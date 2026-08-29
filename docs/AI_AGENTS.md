# AI Agents em SaaS

## Princípio

IA em produção deve ser tratada como um componente com **permissões, contratos, observabilidade e limites**, não como uma camada mágica acima do sistema.

## Arquitetura de referência

```text
User / Channel
   ↓
Conversation Gateway
   ↓
Agent Orchestrator
   ├── policy / guardrails
   ├── memory
   ├── retrieval
   ├── tools
   ├── workflow engine
   └── human handoff
   ↓
Business Services / APIs
```

## Tool calling

Ferramentas devem ter:

- nome e propósito claros;
- schema de argumentos;
- validação server-side;
- autorização independente do modelo;
- timeout;
- idempotência quando necessária;
- audit log para ações de impacto.

O modelo pode **propor** uma ação. A aplicação continua responsável por autorizar e executar.

## RAG

Pipeline conceitual:

```text
ingest
→ normalize
→ chunk
→ metadata
→ index
→ retrieve
→ rerank
→ context policy
→ generation
→ evidence
→ evaluation
```

Em SaaS multi-tenant, metadata e filtros de recuperação devem respeitar o tenant. Um erro de retrieval também pode ser um vazamento de dados.

## Prompt injection

Não tratar conteúdo recuperado como instrução confiável. Separar:

- system/policy;
- developer/business rules;
- user request;
- retrieved content;
- tool outputs.

Ferramentas críticas não devem ser liberadas apenas porque uma instrução apareceu em documento, página, e-mail ou mensagem recuperada.

## Human handoff

Definir handoff quando houver:

- baixa confiança;
- ação financeira/irreversível;
- conflito de políticas;
- identidade não confirmada;
- solicitação fora do escopo;
- repetidas falhas de ferramenta;
- decisão que exija julgamento humano.

## Avaliação

Medir mais que qualidade textual:

```text
task success
retrieval precision
groundedness
tool selection
argument correctness
authorization failures
handoff rate
latency
cost
safety violations
regressions
```

## Observabilidade

Eventos úteis:

```text
request_id
conversation_id
tenant_id
tool_name
tool_result
retrieval_count
model/route
latency
cost estimate
policy decision
handoff reason
final outcome
```

Não registrar prompts ou respostas completas quando isso expuser dados sensíveis sem necessidade.

## Checklist de produção

- [ ] ferramentas possuem autorização server-side;
- [ ] isolamento de tenant é aplicado em retrieval e tools;
- [ ] argumentos são validados;
- [ ] prompt injection foi testada;
- [ ] existe fallback/handoff;
- [ ] ações críticas são auditáveis;
- [ ] evals cobrem fluxos reais;
- [ ] custo e latência são observados;
- [ ] erros degradam de forma segura;
- [ ] regras críticas não vivem apenas no prompt.