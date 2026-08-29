export async function GET() {
  return Response.json({
    status: "ok",
    service: "saas-tenant-dashboard",
  });
}
