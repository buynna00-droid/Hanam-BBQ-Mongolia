import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Admin · Hanam BBQ",
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return <div className="admin-shell">{children}</div>;
}
