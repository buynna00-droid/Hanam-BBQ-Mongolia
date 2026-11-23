"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="admin-panel">
      <h1>Admin unavailable</h1>
      <p>
        The request could not be completed. Check your access, database
        connection, and server configuration.
      </p>
      <button onClick={reset}>Try again</button>{" "}
      <Link href="/admin/login">Sign in</Link>
    </main>
  );
}
