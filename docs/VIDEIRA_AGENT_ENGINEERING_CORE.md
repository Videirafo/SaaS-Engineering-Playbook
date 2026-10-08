# VIDEIRA AGENT ENGINEERING CORE — piloto v0.1

- **Estado:** experimental; somente para o SaaS-Engineering-Playbook.
- **Issue:** [#28](https://github.com/Videirafo/SaaS-Engineering-Playbook/issues/28).
- **Segurança:** sem deploy, sem credenciais, sem chamadas a provedores ou dados de clientes.
- **Escopo:** metodologia e validação de contrato, não instalação de plugins de terceiros.

## Fontes upstream (consultadas em 2026-10-07)

| Padrão | Origem | Uso no piloto |
| --- | --- | --- |
| Superpowers | https://github.com/obra/superpowers | Issue → especificação → plano → testes → revisão |
| Karpathy Skills | https://github.com/multica-ai/andrej-karpathy-skills | Pensar antes; simplicidade; mudança cirúrgica; objetivos verificáveis |
| I Have ADHD | https://github.com/ayghri/i-have-adhd | Ação primeiro; passos numerados (até cinco); estado e próxima ação |
| Claude Octopus | https://github.com/nyldn/claude-octopus | Critérios de revisão concorrente, evidência, quórum e discordância |

Os nomes representam inspirações metodológicas. Não houve importação de código nem execução dos respectivos plugins. Revisão multi-IA real requer provedores, permissões, política de envio de dados e aprovação em tarefa separada.

## Fluxo aplicável

1. **Definir:** vincular uma issue, registrar premissas, escopo explícito, não-objetivos e critérios de aceite testáveis.
2. **Especificar:** produzir uma solução mínima e um plano com verificações por etapa; sem pressupor autorização para produção.
3. **Implementar:** tentar demonstrar falha antes da correção (RED); corrigir somente o escopo aprovado; confirmar GREEN.
4. **Revisar:** auditar mudanças, fontes de evidência e casos adversos; simular divergências com fixtures locais.
5. **Liberar somente após outro processo:** TRUST GATE, CI, revisão humana e governança por SHA permanecem obrigatórios nos projetos consumidores.

## Quatro regras operacionais de Karpathy

1. **Pensar antes do código:** declarar pressupostos, contradições e alternativas; parar em ambiguidade relevante.
2. **Simplicidade:** não criar abstrações ou funcionalidades especulativas.
3. **Mudança cirúrgica:** cada arquivo editado responde à issue; sem refatoração lateral.
4. **Objetivos verificáveis:** critério de aceite ligado a caso de teste, com evidência.

## Comunicação para agentes

Formato de até cinco ações: `Ação → Estado → passos numerados → evidência/bloqueios → próxima ação`. Reportar falhas sem eufemismos, separar planejado, executado e validado; não fabricar execução ou métricas. O limite de cinco itens se aplica a atualizações operacionais, não a logs técnicos ou documentação que exige completude.

## Council / Octopus: modelo de confiança

- O piloto usa **dois revisores fictícios locais**, com pareceres determinísticos de fixture; isso **não** constitui consenso real entre IAs.
- `validate.mjs` verifica 2–12 pareceres, identificadores distintos, evidências referenciadas e fontes na allowlist.
- O piloto exige unanimidade e bloqueia toda discordância/abstenção ou evidência ausente, mais conservador que um quórum de 75%.
- Resultado `PASS_PILOT` **nunca** implica `PRODUCTION_READY`; o verificador retorna `production_ready: false` por construção.
- Revisão real futura: opt-in e read-only, minimização de dados, política de provedores, limite de custo, logs de decisões, aprovação de humano e TRUST GATE.

## Gates verificáveis versus alegações da fixture

O validador `validate.mjs` checa somente **declarações sintaticamente válidas**. Os campos `observed_red`, `observed_green`, `changed_files` e os votos de revisores são auto-relatados e **não** constituem evidência independente, mesmo quando a fixture retorna `PASS_PILOT`.

O workflow realiza duas verificações adicionais verificáveis:
1. executa o conjunto de testes com `node --test`, inclusive os cenários que DEVEM falhar;
2. compara **arquivos reais do PR** com o escopo permitido por `git diff --name-only -z` e `verify-scope.mjs`, rejeitando alterações fora do piloto.

A verificação do diff roda em PRs que acionam o workflow (filtro `paths`); não é uma política global de branch protection. A revisão por outra pessoa continua pendente até ser registrada no GitHub. A autoria/validade das afirmações das fontes não é comprovada por este protótipo. Para produtos, somente artefatos assinados/identificados, testes rastreáveis e o TRUST GATE são evidências suficientes.

## Relação com padrões existentes

| Baseline | Regra de compatibilidade |
| --- | --- |
| [PLAYBOOK](PLAYBOOK.md) | Preservar ciclo de engenharia, TDD e gates existentes |
| [AI_AGENTS](AI_AGENTS.md) | Ferramentas autorizadas no servidor e limites de tenant prevalecem |
| [VIDEIRA TRUST GATE](VIDEIRA_TRUST_GATE.md) | Falha bloqueia; o parecer de IA jamais concede permissão |
| [CONTRIBUTING](../CONTRIBUTING.md) | Issue → branch → validação → PR, mudanças pequenas |

## Critérios de conclusão do piloto

- Testes do validador local passam e fixtures inválidas resultam em bloqueio.
- O workflow usa somente `contents: read`, não exige secrets e não possui deploy.
- O PR permanece em draft até que revisão, CI e evidência sejam avaliados.
- Adesão a outros repositórios será objeto de issues/PRs próprios; nenhum merge automático.
