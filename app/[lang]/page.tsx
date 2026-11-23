import Image from "next/image";
import { notFound } from "next/navigation";
import { existsSync } from "node:fs";
import path from "node:path";
import {
  ArrowDown,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  UtensilsCrossed,
  Flame,
} from "lucide-react";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { ensureLocalPostgres } from "@/scripts/local-postgres.mjs";
import { branchMaps } from "@/lib/locations";
import { BranchMap } from "@/components/branch-map";
import {
  copy,
  footerCopy,
  languages,
  editorialCopy,
  branches,
  type Lang,
} from "@/lib/content";
import { Header } from "@/components/header";
import { PublicMenu } from "@/components/menu";
import { Gallery } from "@/components/gallery";
import { getGallery } from "@/lib/gallery";
import { ScrollBackground } from "@/components/scroll-background";
import { TextReveal } from "@/components/text-reveal";
import { EditorialMotion } from "@/components/editorial-motion";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: "Hanam BBQ Mongolia",
    alternates: {
      canonical: `/${lang}`,
      languages: { mn: "/mn", ko: "/ko", en: "/en", "x-default": "/mn" },
    },
    openGraph: {
      title: "Hanam BBQ Mongolia",
      description: "Hanam BBQ Mongolia · Korean BBQ",
      type: "website",
      locale: lang === "ko" ? "ko_KR" : lang === "en" ? "en_US" : "mn_MN",
    },
  };
}
const asset = (p: string) => existsSync(path.join(process.cwd(), "public", p));
function Photo({
  src,
  label,
  hero = false,
  lang,
}: {
  src: string;
  label: string;
  hero?: boolean;
  lang: Lang;
}) {
  return (
    <div className={`photo ${hero ? "hero-photo" : ""}`}>
      {asset(src) ? (
        <Image
          src={src}
          alt={label}
          fill
          sizes={hero ? "100vw" : "(max-width: 760px) 100vw, 50vw"}
          priority={hero}
          className="photo-img"
        />
      ) : (
        <div className="photo-placeholder">
          <span className="placeholder-line" />
          <span>{copy[lang].photo}</span>
        </div>
      )}
    </div>
  );
}
export default async function Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang: l } = await params;
  if (!languages.includes(l as Lang)) notFound();
  const lang = l as Lang,
    t = copy[lang];
  let categories: Awaited<ReturnType<typeof getMenu>> = [];
  let menuUnavailable = false;
  try {
    categories = await getMenu();
  } catch {
    menuUnavailable = true;
    console.error("Public menu unavailable: check database configuration.");
  }
  const logo = asset("/images/logo/hanam-bbq-logo.png");
  const galleryItems = await getGallery();
  return (
    <div className="restaurant-site">
      <ScrollBackground />
      <TextReveal key={lang} />
      <EditorialMotion key={`editorial-${lang}`} />
      <Header lang={lang} logo={logo} />
      <main>
        <section id="home" className="hero">
          <h1 className="sr-only">Hanam BBQ Mongolia</h1>
          <Photo
            src="/images/hero/hero-bbq.jpg"
            label="Hanam BBQ Mongolia"
            hero
            lang={lang}
          />
          <a href="#about" className="scroll-cue" aria-label={t.scroll}>
            <ArrowDown size={18} />
          </a>
        </section>
        <section id="about" className="editorial section-wrap">
          <Photo
            src="/images/about/about-grilling.jpg"
            label={t.about}
            lang={lang}
          />
          <div className="editorial-copy">
            <span className="section-badge">
              <UtensilsCrossed size={14} aria-hidden="true" />
              {t.aboutTag}
            </span>
            <h2>{t.about}</h2>
            <div className="short-rule" />
            {editorialCopy[lang].about.split("\n").map((p, i) => (
              <p className={i === 0 ? "lead" : ""} key={p}>
                {p}
              </p>
            ))}
          </div>
        </section>
        <div className="editorial-bridge">
          {asset("/images/editorial/grilled-meat.webp") && (
            <div className="editorial-inset">
              <Image
                src="/images/editorial/grilled-meat.webp"
                alt={
                  lang === "mn"
                    ? "Шарсан мах"
                    : lang === "ko"
                      ? "구운 고기"
                      : "Grilled meat"
                }
                fill
                sizes="(max-width: 340px) calc(88vw - 2cm), (max-width: 833px) calc(300px - 2cm), (max-width: 1250px) calc(36vw - 2cm), calc(450px - 2cm)"
              />
            </div>
          )}
        </div>
        <section className="editorial special section-wrap">
          <Photo
            src="/images/special/charcoal-grilling.jpg"
            label={t.special}
            lang={lang}
          />
          <div className="editorial-copy">
            <span className="section-badge">
              <Flame size={14} aria-hidden="true" />
              {t.specialTag}
            </span>
            <h2>{t.special}</h2>
            <div className="short-rule" />
            <p>{editorialCopy[lang].special}</p>
          </div>
        </section>
        <section id="menu" className="section-wrap menu-section">
          <div className="section-heading">
            <h2>{t.menu}</h2>
          </div>
          {menuUnavailable ? (
            <p role="status">
              {lang === "mn"
                ? "Цэс түр ачаалагдахгүй байна. Түр хүлээгээд хуудсыг дахин ачаална уу."
                : lang === "ko"
                  ? "메뉴를 불러올 수 없습니다. 잠시 후 새로고침해 주세요."
                  : "The menu is temporarily unavailable. Please refresh in a moment."}
            </p>
          ) : (
            <PublicMenu categories={categories} lang={lang} />
          )}
        </section>
        <Gallery items={galleryItems} lang={lang} />
        <section id="branches" className="section-wrap locations">
          <div>
            <h2>{t.branches}</h2>
            {branches.map((address, i) => (
              <div className="branch" key={address}>
                <span className="gold">0{i + 1}</span>
                <div>
                  <p lang="mn">{address}</p>
                  {
                    <a
                      className="branch-map-link"
                      href={branchMaps[i].url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin size={15} aria-hidden="true" />
                      {lang === "mn"
                        ? "Google Maps дээр нээх"
                        : lang === "ko"
                          ? "Google Maps에서 보기"
                          : "Open in Google Maps"}
                    </a>
                  }
                </div>
              </div>
            ))}
          </div>
          <BranchMap lang={lang} />
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#home" aria-label={`Hanam BBQ Mongolia · ${t.home}`}>
              {logo ? (
                <Image
                  src="/images/logo/hanam-bbq-logo.png"
                  alt="Hanam BBQ Mongolia"
                  width={648}
                  height={212}
                  className="footer-logo"
                  sizes="220px"
                />
              ) : (
                "Hanam BBQ Mongolia"
              )}
            </a>
            <h3>{footerCopy[lang].phone}</h3>
            <address className="footer-contact">
              <a href="tel:+97670117712">7011-7712</a>
            </address>
          </div>
          <div className="footer-hours">
            <h3>{footerCopy[lang].hours}</h3>
            <dl>
              <div>
                <dt>{footerCopy[lang].days}</dt>
                <dd>12:00–23:00</dd>
              </div>
            </dl>
          </div>
          <div className="footer-links">
            <h3>{footerCopy[lang].links}</h3>
            <nav aria-label={footerCopy[lang].links}>
              <a href="#home">{t.home}</a>
              <a href="#about">{t.about}</a>
              <a href="#menu">{t.menu}</a>
              <a href="#gallery">{t.gallery}</a>
              <a href="#branches">{t.branches}</a>
            </nav>
            <div className="socials">
              <a
                href="https://www.facebook.com/hanambbq.mn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={19} />
              </a>
              <a
                href="https://www.instagram.com/hanambbq.mn/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={19} />
              </a>
              <a
                href="mailto:info@hanambbq.mn"
                aria-label={`${footerCopy[lang].email}: info@hanambbq.mn`}
                title="info@hanambbq.mn"
              >
                <Mail size={19} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Hanam BBQ Mongolia</span>
          <a href="#home">↑ {t.home}</a>
        </div>
      </footer>
    </div>
  );
}
async function getMenu() {
  await ensureLocalPostgres();
  return db.menuCategory.findMany({
    where: { isActive: true, deletedAt: null },
    orderBy: { displayOrder: "asc" },
    include: {
      items: {
        where: { isActive: true, deletedAt: null },
        orderBy: { displayOrder: "asc" },
        include: {
          variants: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
          images: { orderBy: { displayOrder: "asc" } },
        },
      },
    },
  });
}
