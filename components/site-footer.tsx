import Image from "next/image";
import { Facebook, Instagram, Mail } from "lucide-react";
import { copy, footerCopy, type Lang } from "@/lib/content";
export function SiteFooter({ lang, logo }: { lang: Lang; logo: boolean }) {
  const t = copy[lang];
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a
            href={`/${lang}#home`}
            aria-label={`Hanam BBQ Mongolia · ${t.home}`}
          >
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
            <a href={`/${lang}#home`}>{t.home}</a>
            <a href={`/${lang}/about`}>{t.about}</a>
            <a href={`/${lang}/menu`}>{t.menu}</a>
            <a href={`/${lang}#gallery`}>{t.gallery}</a>
            <a href={`/${lang}#branches`}>{t.branches}</a>
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
        <a href={`/${lang}#home`}>↑ {t.home}</a>
      </div>
    </footer>
  );
}
