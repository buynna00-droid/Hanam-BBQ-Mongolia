import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { PublicMenu } from "@/components/menu";
import { getMenu } from "@/lib/public-menu";
import { copy, languages, type Lang } from "@/lib/content";

export const dynamic = "force-dynamic";

function language(value: string): Lang {
  if (!languages.includes(value as Lang)) notFound();
  return value as Lang;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = language((await params).lang);
  return {
    title: `${copy[lang].menu} | Hanam BBQ Mongolia`,
    alternates: {
      canonical: `/${lang}/menu`,
      languages: {
        mn: "/mn/menu",
        ko: "/ko/menu",
        en: "/en/menu",
        "x-default": "/mn/menu",
      },
    },
    openGraph: {
      title: `${copy[lang].menu} | Hanam BBQ Mongolia`,
      url: `/${lang}/menu`,
      type: "website",
    },
  };
}

export default async function MenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const lang = language((await params).lang);
  const initialGroup =
    (await searchParams).group === "DRINKS" ? "DRINKS" : "FOOD";
  let categories: Awaited<ReturnType<typeof getMenu>> = [];
  let unavailable = false;
  try {
    categories = await getMenu();
  } catch {
    unavailable = true;
    console.error("Public menu unavailable: check database configuration.");
  }
  const logo = existsSync(
    path.join(process.cwd(), "public/images/logo/hanam-bbq-logo.png"),
  );
  return (
    <div className="restaurant-site menu-page">
      <Header lang={lang} logo={logo} page="menu" />
      <main className="menu-page-main">
        <div className="menu-page-intro">
          <p className="eyebrow">HANAM BBQ MONGOLIA</p>
          <h1>{copy[lang].menu}</h1>
          <div className="short-rule" />
        </div>
        {unavailable ? (
          <p role="status">
            {lang === "mn"
              ? "Цэс түр ачаалагдахгүй байна. Түр хүлээгээд хуудсыг дахин ачаална уу."
              : lang === "ko"
                ? "메뉴를 불러올 수 없습니다. 잠시 후 새로고침해 주세요."
                : "The menu is temporarily unavailable. Please refresh in a moment."}
          </p>
        ) : (
          <PublicMenu
            key={initialGroup}
            categories={categories}
            lang={lang}
            fullPage
            initialGroup={initialGroup}
          />
        )}
      </main>
      <SiteFooter lang={lang} logo={logo} />
    </div>
  );
}
