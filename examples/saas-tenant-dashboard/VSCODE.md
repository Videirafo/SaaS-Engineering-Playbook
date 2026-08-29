# VS Code + Git workflow

```bash
git clone https://github.com/Videirafo/SaaS-Engineering-Playbook.git
cd SaaS-Engineering-Playbook/examples/saas-tenant-dashboard
code .
```

## Criar uma mudança

```bash
git checkout -b feat/minha-mudanca
npm install
npm run dev
```

Antes do commit:

```bash
npm run typecheck
npm run build
git status
git diff
```

Depois:

```bash
git add .
git commit -m "feat: describe my change"
git push -u origin feat/minha-mudanca
```

Em um fork, abra uma Pull Request do seu branch para o repositório original.
