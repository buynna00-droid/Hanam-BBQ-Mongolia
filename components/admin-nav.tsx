import Link from "next/link";
import { requireUser, csrfToken } from "@/lib/auth";
import { logout } from "@/app/admin/actions";
export async function AdminNav() {
  const user = await requireUser();
  const csrf = await csrfToken();
  return (
    <nav className="admin-nav">
      <Link href="/admin">HANAM / Menu</Link>
      <Link href="/admin/categories">Categories</Link>
      {user.role === "SUPER_ADMIN" && <Link href="/admin/staff">Staff</Link>}
      <Link href="/admin/audit">Audit log</Link>
      <Link href="/mn">Website ↗</Link>
      <small>
        {user.name} · {user.role}
      </small>
      <form action={logout}>
        <input type="hidden" name="csrf" value={csrf} />
        <button>Sign out</button>
      </form>
    </nav>
  );
}
