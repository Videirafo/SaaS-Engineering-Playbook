# SaaS Tenant Dashboard

Projeto executável do **SaaS Engineering Playbook** para demonstrar um ponto de partida multi-tenant com Next.js, TypeScript e App Router.

## Stack

- Next.js 16.3.3
- React 19.2.8
- TypeScript
- App Router
- Server Components

Nenhum banco, token ou API key é necessário para rodar a demonstração.

## Clonar e abrir no VS Code

```bash
git clone https://github.com/Videirafo/SaaS-Engineering-Playbook.git
cd SaaS-Engineering-Playbook/examples/saas-tenant-dashboard
code .
```

Depois:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Health check:

```text
http://localhost:3000/api/health
```

## O que testar

- `/` lista tenants de demonstração;
- `/alpha` abre o workspace Alpha;
- `/beta` abre o workspace Beta;
- slug desconhecido retorna 404;
- `/api/health` comprova que a aplicação está respondendo.

## Estrutura

```text
app/
├── [tenant]/page.tsx
├── api/health/route.ts
├── globals.css
├── layout.tsx
└── page.tsx
lib/
└── tenants.ts
.vscode/
├── extensions.json
└── settings.json
```

## Validação

```bash
npm run typecheck
npm run build
```

## O que este starter não finge resolver

O slug da URL sozinho **não é isolamento multi-tenant**. Em produção, evolua este exemplo com:

1. identidade/autenticação;
2. resolução server-side do tenant;
3. autorização explícita;
4. PostgreSQL com `tenant_id`;
5. RLS ou outra barreira de isolamento;
6. testes negativos de cross-tenant access;
7. audit log para mudanças críticas.

## Fazer sua própria branch e PR

```bash
git checkout -b feat/minha-evolucao
# edite no VS Code
git add .
git commit -m "feat: evoluir SaaS tenant dashboard"
git push -u origin feat/minha-evolucao
```

Se você fez fork do projeto, o `origin` deve apontar para o seu fork.
