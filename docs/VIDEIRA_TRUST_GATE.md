# VIDEIRA TRUST GATE v1

Security is a release property backed by evidence, not a UI feature or checklist claim.

## Trust chain

```text
Human / Agent / Service
        ↓
Identity / Auth
        ↓
Tenant Boundary
        ↓
RBAC + Capability
        ↓
RLS / Record Authorization
        ↓
Data / API / Tools
        ↓
Audit + Privacy/LGPD + Retention
        ↓
Backup + Restore + Evidence
```

## Blocking controls

A production-critical system must fail closed when any applicable blocking control is missing.

| Control | Required outcome |
| --- | --- |
| Identity | Individual human/service/agent identity; no shared authority |
| Authentication | Server-side verified session/token with expiry and revocation |
| Tenant boundary | Tenant comes from authenticated server context, never trusted client input |
| Authorization | Server-side RBAC/capability decision on every protected action |
| Record scope | RLS or equivalent row/resource authorization |
| Secrets | No provider secret, private key or service credential in client/Git/logs |
| CSRF/origin | Cookie-authenticated writes require same-origin or equivalent defense |
| Audit | Actor, scope, action, resource, result and correlation without credentials |
| AI least privilege | Agent receives only required tools/data and cannot escalate capabilities |
| Recovery | Backup plus tested restore path with evidence |

## Privacy controls

For personal/customer data, add:

- purpose and data minimization;
- lawful basis/consent ledger when applicable;
- retention schedule;
- export/correction/deletion workflow;
- third-party/AI disclosure inventory;
- incident and breach response.

A policy document alone is not `enforced`. Until executable/runtime evidence exists, mark the control `partial` or `planned`.

## Evidence model

Each repository should carry `security/trust-gate.json` with:

- `blocking_controls`: must be `enforced`;
- `advisory_controls`: may be `partial` or `planned`, but remain visible;
- evidence paths pointing to tests, migrations, runtime policy, recovery scripts or other executable controls;
- runtime/source roots scanned for accidental secrets and unsafe defaults.

Example:

```json
{
  "version": 1,
  "system": "example-saas",
  "scan_roots": ["app", "lib", "services", "infra"],
  "blocking_controls": {
    "identity": {
      "status": "enforced",
      "evidence": ["tests/auth.test.ts"]
    },
    "tenant_boundary": {
      "status": "enforced",
      "evidence": ["tests/tenant-isolation.test.ts"]
    }
  },
  "advisory_controls": {
    "backup_restore": {
      "status": "partial",
      "note": "Backup exists; periodic isolated restore proof is pending."
    }
  }
}
```

## Human, agent and service identities

Treat agents and integrations as principals, not as invisible superusers.

```text
principal
→ authenticated identity
→ tenant/resource scope
→ capability set
→ policy decision
→ side effect
→ audit receipt
```

An Instagram responder should not inherit finance, user-management or cross-tenant access. A background worker should not receive administrator capabilities merely because it is server-side.

## Release gate

Recommended delivery path:

```text
Issue
→ branch
→ implementation
→ Trust Gate
→ tests/security checks
→ PR
→ CI
→ merge exact SHA
→ governed release
→ health/smoke
→ evidence receipt
→ rollback known
```

Do not bypass the gate because a change is urgent. Emergency paths should be smaller and more observable, not less controlled.

## Recovery standard

A successful `pg_dump` is not proof of recoverability. Production readiness requires:

1. consistent backup;
2. protected/encrypted storage outside the primary failure domain;
3. retention policy;
4. integrity check;
5. isolated restore drill;
6. recovery-time/recovery-point evidence;
7. alert when backup or restore evidence becomes stale.

## Review cadence

Re-run the Trust Gate on every security-sensitive PR and after dependency, auth, tenant, provider or infrastructure changes. Periodically review capabilities and remove privileges that are no longer needed.
