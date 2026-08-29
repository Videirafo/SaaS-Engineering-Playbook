import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/tenants";

type TenantPageProps = {
  params: Promise<{ tenant: string }>;
};

export default async function TenantPage({ params }: TenantPageProps) {
  const { tenant: slug } = await params;
  const tenant = getTenant(slug);

  if (!tenant) {
    notFound();
  }

  return (
    <main className="shell">
      <Link className="back" href="/">← Todos os tenants</Link>
      <section className="hero compact">
        <span className="eyebrow">tenant: {tenant.slug}</span>
        <h1>{tenant.name}</h1>
        <p>Dashboard de demonstração com contexto de tenant resolvido no servidor.</p>
      </section>

      <section className="stats">
        <article className="metric">
          <span>Plano</span>
          <strong>{tenant.plan}</strong>
        </article>
        <article className="metric">
          <span>Usuários ativos</span>
          <strong>{tenant.activeUsers}</strong>
        </article>
        <article className="metric">
          <span>Tickets abertos</span>
          <strong>{tenant.openTickets}</strong>
        </article>
      </section>

      <section className="note">
        <h2>Próxima evolução</h2>
        <ul>
          <li>autenticação e resolução do tenant no servidor;</li>
          <li>PostgreSQL com `tenant_id` e políticas de isolamento;</li>
          <li>testes negativos de acesso cruzado entre tenants;</li>
          <li>audit log para operações críticas.</li>
        </ul>
      </section>
    </main>
  );
}
