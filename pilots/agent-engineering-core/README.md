# Piloto isolado — Videira Agent Engineering Core

**Issue:** https://github.com/Videirafo/SaaS-Engineering-Playbook/issues/28

Implementação demonstrativa *zero-dependency*, sem chamadas de rede, sem instalação de skills, sem conexão com produção e sem leitura de segredos. Inclui **Superpowers** (spec/TDD), **Karpathy** (quatro princípios), **I Have ADHD** (resposta objetiva) e **Octopus** (revisão simulada com evidência).

## Executar no VS Code

Abra o repositório e rode no terminal (Node.js 20+):

```bash
node --test pilots/agent-engineering-core/validate.test.mjs
node pilots/agent-engineering-core/validate.mjs pilots/agent-engineering-core/fixtures/valid.json
```

O comando do validador retorna JSON e código de saída `0` em `PASS_PILOT`; falhas retornam `1`. O validador é apenas um **gate de formato, consistência e políticas** sobre entradas declaradas. Não comprova que modelos externos executaram revisões nem verifica se um teste de produto realmente foi rodado.

## Contrato da fixture

1. `sources`: allowlist completa das quatro referências originais, sem URLs extras.
2. `spec`, `plan` e `tdd`: issue, premissas, aceite testável, até cinco passos e registros RED/GREEN de exemplo.
3. `karpathy` e `communication`: regras declaradas e comunicação com ação, estado e próximo passo.
4. `reviews`: somente `mode: simulated`, 2–12 revisores fictícios distintos, aprovações unânimes e referências a fontes conhecidas.
5. `safety` e `changed_files`: nenhum uso de segredo, tráfego externo, modificação de produção ou proposta de deploy.

## Verificar alterações reais no pull request

Além da validação declarativa da fixture, a CI usa `verify-scope.mjs` para validar os caminhos verdadeiramente alterados no PR. No VS Code, após buscar o branch base:

```bash
git fetch origin main
git diff --no-renames --name-only -z origin/main...HEAD | node pilots/agent-engineering-core/verify-scope.mjs
```

O gate aceita somente o diretório deste piloto, sua documentação canônica e o workflow específico. Arquivos sensíveis/dotfiles no piloto, arquivos de produção, caminhos malformados e entradas sem delimitador NUL bloqueiam. O workflow emprega `--no-renames` para analisar as duas pontas de arquivos movidos. O workflow separado `.github/workflows/agent-engineering-trusted-scope.yml` contém o job `trusted-scope` em `pull_request_target` e a lista de arquivos da API do GitHub, sem checkout, mas **só estará operacional para PRs futuros após sua integração em `main`**. O gate local do próprio PR não constitui proteção independente, e políticas de branch devem exigir o job de base. A execução local depende de `git` e da branch correta. Nenhum teste usa credenciais ou provedores externos.

## Evidências e limites

- Testes negativos cobrem: evidência ausente, discordância, revisor único, fonte não permitida, passos excessivos, princípio ausente e tentativa de produção.
- `PASS_PILOT` não é certificação de segurança de um SaaS: requisitos de Auth, RLS, tenant, LGPD, backup, CI de produto e smoke tests continuam no TRUST GATE.
- Adoção não copia código de fornecedores e não inicia nenhum serviço.


## Status de segurança com identidade de GitHub App — proposta, NÃO ativada

O contrato `app-check-attestor.mjs` e os testes
`app-check-attestor.test.mjs` são um **protótipo offline** de validação
por aplicativo independente de PR. Exigem inventário integral do GitHub
(`filename` e `previous_filename`, limite estrito abaixo de 3.000),
branch-base correta, estado do PR, SHA de 40 caracteres e uma segunda leitura
do HEAD antes de criar o resultado. Falhas geram `failure` ou ausência de
status; não há aprovação implícita.

**Identidade descoberta:** o App existente `videira-mcp` tem App ID
`5049232`, está instalado no repositório via owner `Videirafo` e
possui **`statuses: write`**. Ele não possui `checks: write`
(`checks: read` somente), portanto usamos **Commit Status API** em vez de
**Check Runs API**. O contrato chama `api.createStatus` por um adaptador
injetado pelo executor e reserva o contexto `videira/trusted-scope`.
Nenhum status foi publicado e nenhum check obrigatório do App foi configurado.

### Etapas obrigatórias para ativação

1. Implantar um executor privado e independente dos arquivos do PR, fora
   deste piloto e fora da integração Videira MCP #128, com tratamento seguro
   de webhooks `pull_request` (assinatura, redelivery, autenticação e replay)
   e token de instalação curto da GitHub App existente. A implementação,
   gestão de segredos e deploy desse executor **ainda são pendentes**.
2. O executor implementará `getPull`, `listFiles` com paginação integral
   e `createStatus` via `POST /repos/{owner}/{repo}/statuses/{sha}`.
   O status deverá ser escrito no HEAD exato com contexto
   `videira/trusted-scope` e estado `success` ou `failure`.
   Não executar scripts ou workflows fornecidos por um PR.
3. Verificar na API uma execução real cujo **autor seja o App ID
   `5049232`**. Só depois adicionar o contexto aos required status checks
   de `main`, vinculando-o à origem do GitHub App, **não apenas ao nome**.
   Manter a revisão humana independente, os checks globais e as regras
   existentes.
4. Provar com PR controlado que um job falsificado do GitHub Actions chamado
   `videira/trusted-scope` não satisfaz a exigência de origem. Repetir
   testes negativos com rename origem/destino, arquivo externo, contagem
   incompleta, ausência de token/serviço, troca de SHA e PR fechado.
5. O job experimental `pull_request_target` não é a identidade
   anti-spoof. Antes de exigir qualquer workflow nesse evento, avaliar
   as políticas de Actions e a disponibilidade real do evento. Se o
   status do App assumir o gate, considerar a retirada desse job
   experimental em uma alteração revisada separadamente.

Até completar todas as provas, o P1 **permanece aberto**, o PR #29 não
deve ser mesclado e o Videira MCP #128 fica bloqueado. Não salvar chaves
privadas, webhooks secretos ou tokens neste repositório. `PASS_PILOT`
não autoriza produção. Acompanhar a [issue #30](https://github.com/Videirafo/SaaS-Engineering-Playbook/issues/30).
