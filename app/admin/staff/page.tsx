import { db } from "@/lib/db";
import { requireUser, csrfToken } from "@/lib/auth";
import { AdminNav } from "@/components/admin-nav";
import { AdminForm } from "@/components/admin-form";
import { Check } from "@/components/admin-fields";
import { saveStaff } from "../actions";
export default async function Staff() {
  await requireUser(false, true);
  const csrf = await csrfToken();
  const users = await db.adminUser.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
    orderBy: { createdAt: "asc" },
  });
  return (
    <>
      <AdminNav />
      <main>
        <h1>Staff accounts</h1>
        <p>
          SUPER_ADMIN manages everything. MENU_MANAGER edits the menu. VIEWER
          has read-only access.
        </p>
        {[...users, null].map((u) => (
          <details className="admin-panel" key={u?.id ?? "new"} open={!u}>
            <summary>
              {u
                ? `${u.name} · ${u.role} · ${u.isActive ? "Active" : "Inactive"}`
                : "Create staff account"}
            </summary>
            <AdminForm csrf={csrf} action={saveStaff}>
              <input type="hidden" name="id" value={u?.id ?? ""} />
              <div className="admin-grid">
                <label>
                  <span>Name</span>
                  <input name="name" required defaultValue={u?.name} />
                </label>
                <label>
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    required
                    defaultValue={u?.email}
                  />
                </label>
                <label>
                  <span>Role</span>
                  <select name="role" defaultValue={u?.role ?? "VIEWER"}>
                    <option>SUPER_ADMIN</option>
                    <option>MENU_MANAGER</option>
                    <option>VIEWER</option>
                  </select>
                </label>
              </div>
              <label>
                <span>
                  {u ? "New password (blank keeps existing)" : "Password"} ·
                  12–72 characters
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required={!u}
                  minLength={12}
                  maxLength={72}
                />
              </label>
              <Check
                name="isActive"
                label="Active account"
                checked={u?.isActive ?? true}
              />
            </AdminForm>
          </details>
        ))}
      </main>
    </>
  );
}
