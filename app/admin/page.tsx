import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
export const dynamic = "force-dynamic";
export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const user = await requireUser();
  const q = await searchParams;
  const page = Math.max(1, Math.min(100000, Number(q.page) || 1));
  const where: Prisma.MenuItemWhereInput = {
    deletedAt: null,
    ...(q.category ? { categoryId: q.category } : {}),
    ...(q.status === "active"
      ? { isActive: true }
      : q.status === "hidden"
        ? { isActive: false }
        : {}),
    ...(q.q
      ? {
          OR: [
            { nameMn: { contains: q.q.slice(0, 200), mode: "insensitive" } },
            { nameKo: { contains: q.q.slice(0, 200), mode: "insensitive" } },
            { nameEn: { contains: q.q.slice(0, 200), mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [total, active, categories, count, items, recent] = await Promise.all([
    db.menuItem.count({ where: { deletedAt: null } }),
    db.menuItem.count({ where: { deletedAt: null, isActive: true } }),
    db.menuCategory.findMany({
      where: { deletedAt: null },
      orderBy: { displayOrder: "asc" },
    }),
    db.menuItem.count({ where }),
    db.menuItem.findMany({
      where,
      include: { category: true },
      orderBy: [{ displayOrder: "asc" }, { id: "asc" }],
      skip: (page - 1) * 20,
      take: 20,
    }),
    db.menuItem.findMany({
      where: { deletedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
  ]);
  const pageUrl = (n: number) =>
    `/admin?${new URLSearchParams({ ...Object.fromEntries(Object.entries(q).filter((e): e is [string, string] => !!e[1])), page: String(n) })}`;
  return (
    <>
      <AdminNav />
      <main>
        <div className="actions">
          <h1>Menu overview</h1>
          {user.role !== "VIEWER" && (
            <Link className="button" href="/admin/items/new">
              Add item
            </Link>
          )}
        </div>
        <div className="stats">
          {[
            ["Total items", total],
            ["Active", active],
            ["Hidden", total - active],
            ["Categories", categories.length],
          ].map(([label, value]) => (
            <div key={label} className="stat">
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <form className="filters">
          <label>
            <span>Search names</span>
            <input name="q" defaultValue={q.q} />
          </label>
          <label>
            <span>Category</span>
            <select name="category" defaultValue={q.category ?? ""}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameMn}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Status</span>
            <select name="status" defaultValue={q.status ?? ""}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="hidden">Hidden</option>
            </select>
          </label>
          <button>Filter</button>
        </form>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Order</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.nameMn}
                    <small>{i.nameKo}</small>
                  </td>
                  <td>{i.category.nameMn}</td>
                  <td>{i.price?.toLocaleString() ?? "Pending"} ₮</td>
                  <td>
                    {i.isActive ? "Active" : "Hidden"}
                    {!i.category.isActive ? " · category hidden" : ""}
                  </td>
                  <td>{i.displayOrder}</td>
                  <td>
                    <Link href={`/admin/items/${i.id}`}>
                      {user.role === "VIEWER" ? "View" : "Edit"} →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!items.length && (
          <p className="notice">
            No items found. Import verified menu data or add a draft item.
          </p>
        )}
        <div className="pagination">
          {page > 1 && <Link href={pageUrl(page - 1)}>← Previous</Link>}
          <span>
            Page {page} · {count} results
          </span>
          {page * 20 < count && <Link href={pageUrl(page + 1)}>Next →</Link>}
        </div>
        <section className="admin-panel" style={{ marginTop: 35 }}>
          <h2>Recently updated</h2>
          {recent.map((i) => (
            <p key={i.id}>
              <Link href={`/admin/items/${i.id}`}>{i.nameMn}</Link> ·{" "}
              {i.updatedAt.toISOString().slice(0, 16).replace("T", " ")} UTC
            </p>
          ))}
        </section>
      </main>
    </>
  );
}
