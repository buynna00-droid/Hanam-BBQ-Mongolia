import Image from "next/image";
import { ArrowUpRight, Images, Instagram, Facebook } from "lucide-react";
import type { GalleryEntry } from "@/lib/gallery";
import type { Lang } from "@/lib/content";
const text = {
  mn: {
    title: "Зургийн цомог",
    empty: "Зураг, бичлэг нэмэгдэхийг хүлээж байна.",
    open: "Зургийг нээх",
    photo: "Hanam BBQ-ийн зураг",
    video: "Hanam BBQ-ийн бичлэг",
    captions: "Хадмал",
    scroll: "Хажуу тийш гүйлгэж үзэх ↔",
  },
  ko: {
    title: "갤러리",
    empty: "사진과 동영상을 준비하고 있습니다.",
    open: "사진 열기",
    photo: "Hanam BBQ 사진",
    video: "Hanam BBQ 동영상",
    captions: "자막",
    scroll: "좌우로 스크롤하세요 ↔",
  },
  en: {
    title: "Gallery",
    empty: "Photos and videos are coming soon.",
    open: "Open photo",
    photo: "Hanam BBQ photo",
    video: "Hanam BBQ video",
    captions: "Captions",
    scroll: "Scroll sideways to explore ↔",
  },
};
const mediaUrl = (file: string) =>
  `/images/gallery/${encodeURIComponent(file)}`;
export function Gallery({
  items,
  lang,
}: {
  items: GalleryEntry[];
  lang: Lang;
}) {
  const t = text[lang];
  const rows = [
    {
      platform: "Instagram",
      url: "https://www.instagram.com/hanambbq.mn/",
      Icon: Instagram,
    },
    {
      platform: "Facebook",
      url: "https://www.facebook.com/hanambbq.mn",
      Icon: Facebook,
    },
  ];
  return (
    <section id="gallery" className="section-wrap gallery-section">
      <div className="gallery-heading">
        <h2>{t.title}</h2>
      </div>
      {items.length ? (
        <div className="gallery-social-rows">
          {rows.map(({ platform, url, Icon }, row) => (
            <div className="gallery-social-row" key={platform}>
              <div className="gallery-row-heading">
                <span>@HANAMBBQ.MN</span>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ArrowUpRight size={18} aria-hidden="true" />
                  {platform}
                  {lang === "mn"
                    ? "-д дагах"
                    : lang === "ko"
                      ? " 팔로우"
                      : " · Follow"}
                </a>
              </div>
              <div
                className="gallery-grid"
                tabIndex={0}
                role="region"
                aria-label={platform}
              >
                {items
                  .filter((_, index) => index % 2 === row)
                  .map((item) => {
                    const caption = item.caption?.[lang];
                    const alt =
                      item.alt?.[lang] ??
                      item.alt?.mn ??
                      (item.type === "image" ? t.photo : t.video);
                    return (
                      <figure className="gallery-card" key={item.id}>
                        {item.type === "image" ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`gallery-image${item.width && item.height ? " gallery-image-natural" : ""}`}
                            style={
                              item.width && item.height
                                ? {
                                    aspectRatio: `${item.width} / ${item.height}`,
                                  }
                                : undefined
                            }
                            aria-label={`${platform} · @hanambbq.mn: ${alt}`}
                          >
                            <Image
                              src={mediaUrl(item.file)}
                              alt={alt}
                              fill
                              sizes="(max-width: 600px) 29vw, 30vw"
                            />
                            <span className="gallery-open">
                              <Icon
                                size={32}
                                strokeWidth={1.5}
                                aria-hidden="true"
                              />
                            </span>
                          </a>
                        ) : (
                          <div className="gallery-image">
                            <video
                              controls
                              playsInline
                              preload="metadata"
                              poster={
                                item.poster ? mediaUrl(item.poster) : undefined
                              }
                              aria-label={alt}
                            >
                              <source
                                src={mediaUrl(item.file)}
                                type={
                                  item.file.toLowerCase().endsWith(".webm")
                                    ? "video/webm"
                                    : "video/mp4"
                                }
                              />
                              {item.captions && (
                                <track
                                  kind="captions"
                                  src={mediaUrl(item.captions)}
                                  srcLang={item.captionLanguage ?? "mn"}
                                  label={t.captions}
                                  default
                                />
                              )}
                              <a href={mediaUrl(item.file)}>{t.video}</a>
                            </video>
                          </div>
                        )}
                        {caption && <figcaption>{caption}</figcaption>}
                      </figure>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="gallery-empty" role="status">
          <Images size={28} aria-hidden="true" />
          <p>{t.empty}</p>
        </div>
      )}
    </section>
  );
}
