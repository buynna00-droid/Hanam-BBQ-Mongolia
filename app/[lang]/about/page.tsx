import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { existsSync } from "node:fs";
import path from "node:path";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { copy, languages, branches, type Lang } from "@/lib/content";
import { aboutPageCopy } from "@/lib/about-content";
import { aboutStory } from "@/lib/about-story";
import { branchMaps } from "@/lib/locations";

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
    title: `${copy[lang].about} | Hanam BBQ Mongolia`,
    description: aboutStory[lang].intro,
    alternates: {
      canonical: `/${lang}/about`,
      languages: {
        mn: "/mn/about",
        ko: "/ko/about",
        en: "/en/about",
        "x-default": "/mn/about",
      },
    },
    openGraph: {
      title: `${copy[lang].about} | Hanam BBQ Mongolia`,
      description: aboutStory[lang].intro,
      url: `/${lang}/about`,
      type: "website",
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const lang = language((await params).lang);
  const t = copy[lang],
    detail = aboutPageCopy[lang],
    story = aboutStory[lang];
  const logo = existsSync(
    path.join(process.cwd(), "public/images/logo/hanam-bbq-logo.png"),
  );
  return (
    <div className="restaurant-site about-page">
      <Header lang={lang} logo={logo} page="about" />
      <main className="about-page-main">
        <div className="about-page-intro">
          <Link className="about-back" href={`/${lang}`}>
            ← {detail.back}
          </Link>
          <p className="eyebrow">HANAM BBQ MONGOLIA</p>
          <h1>{t.about}</h1>
          <p className="about-page-lead">{story.intro}</p>
        </div>
        <StoryPhoto file="chef.jpg" alt={detail.photo} lang={lang} priority />
        <dl className="about-facts">
          {[
            { value: "2020", label: story.since },
            { value: "200+", label: story.locations },
            { value: "2", label: story.local },
          ].map((fact) => (
            <div key={fact.value}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
        <section className="about-story" aria-labelledby="history-heading">
          <div>
            <p className="eyebrow">01</p>
            <h2 id="history-heading">{detail.history}</h2>
          </div>
          <div>
            <h3>{detail.beginning}</h3>
            <p>{story.history}</p>
            <StoryPhoto
              file="history.jpg"
              alt={story.restaurantAlt}
              lang={lang}
            />
          </div>
        </section>
        <section className="about-story" aria-labelledby="experience-heading">
          <div>
            <p className="eyebrow">02</p>
            <h2 id="experience-heading">{story.craft}</h2>
            <StoryPhoto file="craft.jpg" alt={story.grillingAlt} lang={lang} />
          </div>
          <div>
            <div className="about-features">
              {story.features.map((feature, i) => (
                <article key={feature.title}>
                  <span className="eyebrow">0{i + 1}</span>
                  <h3>{feature.title}</h3>
                  {feature.korean && (
                    <span className="about-korean" lang="ko">
                      {feature.korean}
                    </span>
                  )}
                  <p>{feature.body}</p>
                </article>
              ))}
            </div>
            <Link className="about-detail-link" href={`/${lang}#menu`}>
              {detail.menu} <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
        <section className="about-values" aria-labelledby="values-heading">
          <p className="eyebrow">03</p>
          <h2 id="values-heading">{story.valuesTitle}</h2>
          <div className="about-values-grid">
            {story.values.map((value) => (
              <article key={value.korean}>
                <span className="about-value-korean" lang="ko">
                  {value.korean}
                </span>
                <h3>{value.title}</h3>
                <p>{value.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="about-story" aria-labelledby="visit-heading">
          <div>
            <p className="eyebrow">04</p>
            <h2 id="visit-heading">{detail.visit}</h2>
          </div>
          <div>
            {branches.map((address, i) => (
              <div className="about-branch" key={address}>
                <h3>{branchMaps[i].name}</h3>
                <p lang="mn">{address}</p>
                <a
                  href={branchMaps[i].url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Maps ↗
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} logo={logo} />
    </div>
  );
}

function StoryPhoto({
  file,
  alt,
  lang,
  priority = false,
}: {
  file: string;
  alt: string;
  lang: Lang;
  priority?: boolean;
}) {
  const src = `/images/about-detail/${file}`;
  const exists = existsSync(path.join(process.cwd(), "public", src));
  return (
    <div className="about-page-photo">
      {exists ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 760px) 88vw, 900px"
          priority={priority}
        />
      ) : (
        <p className="about-photo-pending">{copy[lang].photo}</p>
      )}
    </div>
  );
}
