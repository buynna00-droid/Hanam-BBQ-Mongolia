import { db } from "@/lib/db";
import { requireUser, csrfToken } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { AdminForm } from "@/components/admin-form";
import { TranslationFields, Order, Check } from "@/components/admin-fields";
import { saveCategory, moveItems } from "../actions";
export default async function Categories() {
  const user = await requireUser();
  const csrf = await csrfToken();
  const categories = await db.menuCategory.findMany({
    where: { deletedAt: null },
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { items: { where: { deletedAt: null } } } } },
  });
  return (
    <>
      <AdminNav />
      <main>
        <h1>Categories</h1>
        <p>
          Deactivating a category hides its menu items without deleting them.
          Lower display orders appear first.
        </p>
        {[...categories, null].map((c, i) => (
          <details className="admin-panel" key={c?.id ?? "new"} open={!c}>
            <summary>
              {c
                ? `${c.nameMn} · ${c._count.items} items · ${c.isActive ? "Active" : "Hidden"} · order ${c.displayOrder}`
                : "Create category"}
            </summary>
            <fieldset disabled={user.role === "VIEWER"}>
              <AdminForm action={saveCategory} csrf={csrf}>
                <input type="hidden" name="id" value={c?.id ?? ""} />
                <TranslationFields value={c ?? {}} />
                <div className="admin-grid">
                  <label>
                    <span>Slug *</span>
                    <input
                      required
                      name="slug"
                      defaultValue={c?.slug}
                      pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    />
                  </label>
                  <label>
                    <span>Group</span>
                    <select name="group" defaultValue={c?.group ?? "FOOD"}>
                      <option>FOOD</option>
                      <option>DRINKS</option>
                    </select>
                  </label>
                  <Order value={c?.displayOrder ?? i} />
                </div>
                <Check
                  name="isActive"
                  label="Active category"
                  checked={c?.isActive}
                />
              </AdminForm>
            </fieldset>
          </details>
        ))}
        {user.role !== "VIEWER" && (
          <section className="admin-panel">
            <h2>Move all items between categories</h2>
            <AdminForm csrf={csrf} action={moveItems} label="Move items">
              <div className="admin-grid">
                {["from", "to"].map((name) => (
                  <label key={name}>
                    <span>
                      {name === "from" ? "From category" : "To category"}
                    </span>
                    <select required name={name}>
                      <option value="">Choose category</option>
                      {categories.map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.nameMn}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </AdminForm>
          </section>
        )}
      </main>
    </>
  );
}
