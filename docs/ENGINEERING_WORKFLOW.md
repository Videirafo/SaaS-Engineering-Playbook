# Programação Vibe + Production Engineering

Este playbook adota o fluxo **Programação Vibe + Videira Master Context** como modelo canônico para desenvolvimento assistido por IA.

## Fluxo de produto para produção
Ideia → Pesquisa → Usuário → PRD → Stack → Arquitetura → Design → Regras → Tarefas → Setup → Desenvolvimento → Testes → Segurança → Code Review → Preview/QA → Produção → Monitoramento → Iteração.

## Loop por funcionalidade
**Ler → Compreender → Planejar → Implementar → Testar → Revisar → Corrigir → Commit → Atualizar documentação.**

## Documentação por maturidade

### Mínimo
- PRD/escopo
- RULES
- TASKS
- README
- .env.example

### Produto em crescimento
Adicionar:
- ARCHITECTURE
- DESIGN
- TEST_PLAN
- SECURITY
- DECISIONS
- MEMORY

### Produção crítica
Adicionar:
- threat model
- ADRs
- CI/CD governado
- staging/preview
- E2E
- observabilidade
- backup/restore
- rollback
- incident response
- evidências de deploy

## Regra central
O processo deve ser proporcional ao risco, mas nunca eliminar planejamento, versionamento, testes, segurança ou validação pós-deploy.

## Prompt de execução
Todo agente deve receber: **Contexto + Tarefa + Arquivos + Restrições + Critérios de Aceitação + Testes**.

## Governança recomendada
Issue → branch → mudança pequena → testes → PR → CI → revisão → preview/QA → merge → deploy do SHA → smoke → evidências → aprendizado.
