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
git diff --name-only -z origin/main...HEAD | node pilots/agent-engineering-core/verify-scope.mjs
```

O gate aceita somente o diretório deste piloto, sua documentação canônica e o workflow específico. Arquivos sensíveis/dotfiles no piloto, arquivos de produção, caminhos malformados e entradas sem delimitador NUL bloqueiam. O workflow emprega `--no-renames` para analisar as duas pontas de arquivos movidos. Um segundo job `trusted-scope` usa `pull_request_target` e a lista de arquivos da API do GitHub, sem checkout, mas **só estará operacional para PRs futuros após sua integração em `main`**. O gate local do próprio PR não constitui proteção independente, e políticas de branch devem exigir o job de base. A execução local depende de `git` e da branch correta. Nenhum teste usa credenciais ou provedores externos.

## Evidências e limites

- Testes negativos cobrem: evidência ausente, discordância, revisor único, fonte não permitida, passos excessivos, princípio ausente e tentativa de produção.
- `PASS_PILOT` não é certificação de segurança de um SaaS: requisitos de Auth, RLS, tenant, LGPD, backup, CI de produto e smoke tests continuam no TRUST GATE.
- Adoção não copia código de fornecedores e não inicia nenhum serviço.
