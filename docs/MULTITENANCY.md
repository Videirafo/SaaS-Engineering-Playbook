# Arquitetura Multi-Tenant

## Objetivo

Garantir que múltiplos clientes compartilhem a plataforma sem compartilhar indevidamente dados, permissões ou contexto operacional.

## Modelos comuns

### Banco compartilhado + schema compartilhado

Cada tabela relevante possui `tenant_id`.

**Vantagens**
- operação simples;
- custo menor;
- migrations centralizadas.

**Riscos**
- qualquer consulta sem filtro correto pode vazar dados;
- autorização precisa ser consistente em todas as camadas.

### Banco compartilhado + schema por tenant

Maior separação lógica, mas migrations e operação ficam mais complexas.

### Banco por tenant

Maior isolamento operacional, com maior custo e complexidade de provisionamento, observabilidade e migrations.

## Contexto de tenant

Nunca confiar apenas em um `tenant_id` enviado livremente pelo cliente.

Fluxo:

```text
request
→ authenticated identity
→ selected tenant
→ membership lookup
→ authorization policy
→ tenant-scoped data access
```

## Regras de dados

Quando aplicável:

- `tenant_id` NOT NULL;
- foreign keys coerentes;
- índices iniciados por `tenant_id` para consultas frequentes;
- constraints que evitem relacionar entidades de tenants diferentes;
- RLS/policies quando a tecnologia suportar e o modelo justificar;
- service/repository layer recebendo contexto de tenant explicitamente.

## Jobs e eventos

Todo job assíncrono que manipula dado de cliente deve carregar contexto suficiente para reconstruir autorização e isolamento.

Exemplo conceitual:

```json
{
  "job_type": "send-reminder",
  "tenant_id": "tenant-reference",
  "resource_id": "resource-reference",
  "correlation_id": "request-reference"
}
```

Não incluir tokens, senhas ou payloads sensíveis sem necessidade.

## Testes obrigatórios

Para um endpoint de leitura/alteração:

```text
Tenant A + recurso A → permitido conforme role
Tenant A + recurso B → negado/not found
Tenant B + recurso A → negado/not found
Usuário sem membership → negado
Usuário com role insuficiente → negado
Worker com contexto incorreto → falha segura
```

## Auditabilidade

Ações críticas devem registrar, quando permitido:

- ator;
- tenant;
- ação;
- recurso;
- resultado;
- timestamp;
- correlation/request ID.

Evite gravar conteúdo sensível completo em logs.

## Checklist

- [ ] origem do tenant é confiável;
- [ ] membership é validada;
- [ ] autorização é server-side;
- [ ] queries são tenant-scoped;
- [ ] jobs carregam tenant context;
- [ ] cache inclui namespace do tenant;
- [ ] storage usa segregação lógica/física adequada;
- [ ] testes negativos existem;
- [ ] logs não vazam dados;
- [ ] export/delete seguem o mesmo isolamento.