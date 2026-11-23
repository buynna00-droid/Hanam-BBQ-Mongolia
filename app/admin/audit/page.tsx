import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
export default async function Audit() {
  await requireUser();
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true } } },
  });
  return (
    <>
      <AdminNav />
      <main>
        <h1>Audit log</h1>
        <p>Latest 100 changes · UTC</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>When</th>
                <th>Who</th>
                <th>Action</th>
                <th>Record</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{l.createdAt.toISOString()}</td>
                  <td>{l.actor?.name ?? "Seed / system"}</td>
                  <td>{l.action}</td>
                  <td>
                    {l.entity}
                    <small>{l.entityId}</small>
                  </td>
                  <td>
                    <details>
                      <summary>View</summary>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          maxWidth: 450,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {JSON.stringify(l.details, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
