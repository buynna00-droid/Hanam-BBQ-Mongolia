"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { copy, languages, type Lang } from "@/lib/content";
export function Header({
  lang,
  logo,
  page = "home",
}: {
  lang: Lang;
  logo: boolean;
  page?: "home" | "about" | "menu";
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("home");
  const [hidden, setHidden] = useState(false);
  const t = copy[lang];
  useEffect(() => {
    let previousY = Math.max(0, window.scrollY);
    const handleScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      if (currentY <= 94) {
        setHidden(false);
        previousY = currentY;
        return;
      }
      // Ignore small scroll movements so the header does not flicker.
      if (Math.abs(currentY - previousY) < 8) return;
      setHidden(currentY > previousY);
      previousY = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    if (page !== "home") return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px" },
    );
    document
      .querySelectorAll("section[id]")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [lang, page]);
  return (
    <header className={`site-header${hidden && !open ? " is-hidden" : ""}`}>
      <Link href={`/${lang}`} className="brand" aria-label="Hanam BBQ Mongolia">
        {logo ? (
          <Image
            src="/images/logo/hanam-bbq-logo.png"
            alt="Hanam BBQ Mongolia"
            width={648}
            height={212}
            className="brand-logo"
            sizes="(max-width: 700px) 180px, 220px"
            priority
          />
        ) : (
          <span>
            HANAM <b>BBQ</b>
            <small>{t.logo}</small>
          </span>
        )}
      </Link>
      <button
        className="mobile-toggle"
        aria-label={open ? t.closeMenu : t.openMenu}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <nav
        className={open ? "navigation open" : "navigation"}
        aria-label={t.menu}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      >
        {(["home", "about", "menu", "gallery", "branches"] as const).map(
          (id) => (
            <a
              key={id}
              href={
                id === "about" || id === "menu"
                  ? `/${lang}/${id}`
                  : page !== "home"
                    ? `/${lang}#${id}`
                    : `#${id}`
              }
              aria-current={
                page !== "home"
                  ? id === page
                    ? "page"
                    : undefined
                  : active === id
                    ? "location"
                    : undefined
              }
              onClick={() => setOpen(false)}
            >
              {t[id]}
            </a>
          ),
        )}
        <div className="languages">
          {languages.map((l) => (
            <Link
              key={l}
              href={`/${l}${page !== "home" ? `/${page}` : ""}`}
              lang={l}
              onClick={() => setOpen(false)}
              aria-current={l === lang ? "page" : undefined}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
