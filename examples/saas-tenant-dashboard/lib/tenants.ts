export type Tenant = {
  slug: string;
  name: string;
  plan: "Starter" | "Pro";
  activeUsers: number;
  openTickets: number;
};

const tenantCatalog: Record<string, Tenant> = {
  alpha: {
    slug: "alpha",
    name: "Alpha Workspace",
    plan: "Pro",
    activeUsers: 18,
    openTickets: 4,
  },
  beta: {
    slug: "beta",
    name: "Beta Workspace",
    plan: "Starter",
    activeUsers: 7,
    openTickets: 1,
  },
};

export function listTenants(): Tenant[] {
  return Object.values(tenantCatalog);
}

export function getTenant(slug: string): Tenant | null {
  return tenantCatalog[slug] ?? null;
}
