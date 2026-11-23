import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/noto-sans/400.css";
import "@fontsource/noto-serif/400.css";
import "@fontsource/noto-sans-kr/400.css";
import "./globals.css";
import "./restaurant.css";
export const metadata: Metadata = {
  title: "Hanam BBQ Mongolia",
  description: "Hanam BBQ Mongolia · Korean BBQ",
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = (await headers()).get("x-hanam-language") ?? "mn";
  return (
    <html lang={lang} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
