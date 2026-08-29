import Link from "next/link";
import { listTenants } from "@/lib/tenants";

export default function HomePage() {
  const tenants = listTenants();

  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">SaaS Engineering Playbook · executable example</span>
        <h1>Tenant Dashboard</h1>
        <p>
          Starter mínimo para demonstrar roteamento por tenant, isolamento de contexto e uma base limpa para evoluir para autenticação, banco e RLS.
        </p>
      </section>

      <section className="grid" aria-label="Tenants de demonstração">
        {tenants.map((tenant) => (
          <Link className="card" href={`/${tenant.slug}`} key={tenant.slug}>
            <span className="pill">{tenant.plan}</span>
            <h2>{tenant.name}</h2>
            <p>{tenant.activeUsers} usuários ativos · {tenant.openTickets} tickets abertos</p>
            <strong>Abrir workspace →</strong>
          </Link>
        ))}
      </section>

      <section className="note">
        <h2>Princípio demonstrado</h2>
        <p>
          O slug da URL identifica o contexto visual, mas um SaaS real ainda deve resolver o tenant autenticado no servidor e aplicar autorização/isolamento no acesso aos dados.
        </p>
      </section>
    </main>
  );
}
