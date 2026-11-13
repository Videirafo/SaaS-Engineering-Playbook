# AGENTS.md — SaaS Engineering Playbook

## Fonte de verdade
Leia `README.md`, `docs/PLAYBOOK.md`, `docs/VIDEIRA_AGENT_ENGINEERING_CORE.md`, `docs/VIDEIRA_TRUST_GATE.md` e os contratos de segurança e teste relevantes antes de alterar exemplos, templates ou documentação.

## Execução paralela obrigatória
Para tarefas de agentes simultâneos, consultar `docs/PARALLEL_AGENTS.md`. Um coordenador registra a Issue e a matriz de escopo e atribui a cada agente uma **Git worktree + branch exclusiva**. Cada agente recebe prompt individual, arquivos permitidos e handoff com SHA e evidências. Reservar arquivos compartilhados ao coordenador; inspecionar diffs; integrar alterações por PR, uma por vez, somente após gates no SHA exato.

`bash scripts/setup-parallel-worktrees.sh issue-N` cria três worktrees locais a partir de um único commit, com checagem de conflitos de nomes. Não inicia agentes nem executa testes, push, merge ou deploy.

## Segurança e qualidade
Não criar worktrees em produção; não versionar segredos, dados privados ou endpoints internos. Preservar isolamento de tenants, contratos de autorização e TRUST GATE. Não inventar estado de CI nem considerar um PR aprovado sem validações executadas. Entregar alterações sempre em branch isolada e PR revisável; jamais publicar automaticamente.
