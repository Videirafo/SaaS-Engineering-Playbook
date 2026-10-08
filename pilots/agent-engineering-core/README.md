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


## Identidade antifalsificação de check (proposta isolada — NÃO ativada)

O contrato `app-check-attestor.mjs` foi adicionado com testes em
`app-check-attestor.test.mjs`. Ele recebe snapshots obtidos da API do GitHub
por um **serviço privado que opere como GitHub App**, examina os caminhos reais
(`filename` e `previous_filename`), compara a quantidade declarada pelo
GitHub com a listagem completa, bloqueia respostas truncadas (3.000 arquivos),
confere o SHA do PR novamente e só então chama `api.createCheck`.

**Situação comprovada:** o GitHub App existente `videira-mcp` (App ID
`5049232`) está instalado no proprietário `Videirafo`, mas a consulta pública
de permissões confirmou `checks: read`, não `checks: write`. Por isso **NÃO
há check emitido pelo App e NÃO existe bloqueio por identidade em produção**.
Os testes deste diretório usam apenas adaptadores simulados.

Ativação controlada, fora deste piloto:

1. O proprietário da GitHub App deve autorizar `Checks: Read & write`
   e aprovar as permissões atualizadas na instalação. Não inserir tokens,
   chaves privadas ou `APP_PRIVATE_KEY` neste repositório nem em PRs.
2. Instalar um executor **externo e protegido**, que valide o webhook GitHub
   (assinatura/autenticidade, evento e reentregas), obtenha um token de
   instalação de duração curta, chame `pulls.get` e `pulls.listFiles` com
   todas as páginas e injete um adaptador `api.createCheck` que use
   `POST /repos/{owner}/{repo}/check-runs`. O executor **não pode carregar
   scripts, código ou configuração do PR**. Usar somente versão aprovada
   e fixada do avaliador. Revisar acesso ao código da branch-base.
3. Emitir check `videira/trusted-scope` no **SHA do HEAD do PR** com emissor
   App ID `5049232`; somente então configurar esse check como requerido
   na proteção de `main` e **vinculá-lo ao App ID correto**, nunca apenas ao
   nome de um job do GitHub Actions.
4. Provar o gate negativo em PRs isolados: um job
   `videira/trusted-scope` com `if: false` não pode falsificar o check do
   App; arquivos de produção, renames, contagem truncada, troca de SHA e
   indisponibilidade do App devem causar bloqueio. Acompanhar o job antigo
   `pull_request_target`: ele é *advisory* e não representa esse App.
5. Após teste de origem e resiliência, obter novo parecer do revisor humano
   independente e somente então considerar merge e rollout por SHA.
   O Videira MCP #128 permanece bloqueado até terminar essas etapas.

Nenhuma permissão ou segredo foi alterado pela implementação do contrato.
`PASS_PILOT` não autoriza merge. Consultar a
[issue de governança #30](https://github.com/Videirafo/SaaS-Engineering-Playbook/issues/30).
