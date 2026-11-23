import Link from "next/link";
import { redirect } from "next/navigation";
import { csrfToken, currentUser } from "@/lib/auth";
import { AdminForm } from "@/components/admin-form";
import { login } from "../actions";
export const dynamic = "force-dynamic";
export default async function Login() {
  if (await currentUser()) redirect("/admin");
  let token: string;
  try {
    token = await csrfToken();
  } catch {
    return (
      <main className="login admin-panel">
        <h1>Admin setup required</h1>
        <p>
          Configure SESSION_SECRET and DATABASE_URL, apply migrations, then
          create the first administrator. See README.md.
        </p>
        <Link href="/mn">Return to website</Link>
      </main>
    );
  }
  return (
    <main className="login admin-panel">
      <span className="eyebrow">HANAM BBQ / ADMIN</span>
      <h1>Welcome back.</h1>
      <p>Sign in to manage the menu.</p>
      <AdminForm csrf={token} action={login} label="Sign in">
        <label>
          <span>Email</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="username"
            maxLength={254}
          />
        </label>
        <label>
          <span>Password</span>
          <input
            required
            name="password"
            type="password"
            autoComplete="current-password"
            maxLength={128}
          />
        </label>
      </AdminForm>
      <p style={{ marginTop: 25 }}>
        <Link href="/mn">← Public website</Link>
      </p>
    </main>
  );
}
