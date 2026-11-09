# Vibe Coding Blueprint — Auditoria estrutural
Ferramenta **somente leitura** para verificar a presença dos oito documentos centrais do padrão, com `AGENTS.md` na raiz, e `UX_FLOWS.md`/`API.md` quando relevantes.
Não modifica código, projetos, VPS, CI ou produção, nem instala dependências. Não inspeciona a qualidade dos documentos: `STRUCTURE_PRESENT` **não significa funcionalidade validada**.

## Uso no VS Code
```bash
node tools/blueprint-audit.mjs /caminho/do/projeto
node tools/blueprint-audit.mjs /caminho/do/projeto --json
node tools/blueprint-audit.mjs /caminho/do/projeto --ux --api
node --test tests/blueprint-audit.test.mjs
```

Saídas: `STRUCTURE_PRESENT` (exit 0), `INCOMPLETE` (exit 1) ou erro de execução (exit 2).
A checagem requer arquivos regulares não vazios. Para projetos com documentação legada equivalente mas outro nome, usar o resultado para **mapear/decidir**, não duplicar documentos automaticamente. Provas de teste/build/segurança/deploy precisam de verificações independentes.

## O que cada documento cobre
| Arquivo | Responsabilidade |
| --- | --- |
| AGENTS.md | Regras para agentes; referências para a documentação |
| docs/PRD.md | Objetivo, usuários, escopo, histórias e aceitação |
| docs/DESIGN_SYSTEM.md | Marca, tokens, componentes, responsividade e acessibilidade |
| docs/ARCHITECTURE.md | Stack, fronteiras, dependências, falhas e escala |
| docs/DATABASE.md | Dados, relações, migrations, retenção e backup |
| docs/SECURITY.md | Auth, RBAC/RLS, segredos, dados e APIs |
| docs/CODE_STYLE.md | Convenções de implementação e manutenção |
| docs/TESTING.md | Testes e evidências de entrega |
| docs/UX_FLOWS.md | Opcional: jornadas e estados |
| docs/API.md | Opcional: contratos, auth, erros e idempotência |

Fonte editorial: The Vibe Coding Blueprint fornecido pelo proprietário. Não usar placeholder como decisão técnica; inspecionar código e fontes reais.
