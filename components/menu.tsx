"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type {
  MenuCategory,
  MenuItem,
  MenuItemImage,
  MenuItemVariant,
} from "@prisma/client";
import { copy, localized, type Lang } from "@/lib/content";
type Category = MenuCategory & {
  items: (MenuItem & {
    variants: MenuItemVariant[];
    images: MenuItemImage[];
  })[];
};
export function PublicMenu({
  categories,
  lang,
  fullPage = false,
  initialGroup = "FOOD",
}: {
  categories: Category[];
  lang: Lang;
  fullPage?: boolean;
  initialGroup?: "FOOD" | "DRINKS";
}) {
  const [group, setGroup] = useState(initialGroup);
  const [filter, setFilter] = useState("");
  const t = copy[lang];
  const visible = categories.filter((c) => c.group === group);
  const allItems = visible.flatMap((category) => category.items);
  const selectedCategory = visible.some((category) => category.id === filter)
    ? filter
    : visible[0]?.id;
  const shownCategories = visible
    .filter((category) => category.id === selectedCategory)
    .map((category) => ({
      ...category,
      items: fullPage ? category.items : category.items.slice(0, 10),
    }))
    .filter((category) => category.items.length > 0);
  const price = (p: number | null) =>
    p === null
      ? t.price
      : new Intl.NumberFormat(
          lang === "mn" ? "mn-MN" : lang === "ko" ? "ko-KR" : "en-US",
        ).format(p) + " ₮";
  const CategoryHeading = fullPage ? "h2" : "h3";
  const ItemHeading = fullPage ? "h3" : "h4";
  return (
    <>
      <div className="menu-tabs" role="group" aria-label={t.menu}>
        {(["FOOD", "DRINKS"] as const).map((g) => (
          <button
            key={g}
            aria-pressed={group === g}
            onClick={() => {
              setGroup(g);
              setFilter("");
            }}
          >
            {g === "FOOD" ? t.food : t.drinks}
          </button>
        ))}
      </div>
      <div className="category-filters">
        {visible.map((c) => (
          <button
            key={c.id}
            aria-pressed={selectedCategory === c.id}
            onClick={() => {
              setFilter(c.id);
            }}
          >
            {localized(c, "name", lang) ?? t.translation}
          </button>
        ))}
      </div>
      <div id="menu-results">
        {!shownCategories.length ? (
          <div className="empty-menu">
            <span>—</span>
            <p>{t.empty}</p>
          </div>
        ) : (
          shownCategories.map((c) => (
            <div key={c.id} className="menu-category">
              <CategoryHeading>
                {localized(c, "name", lang) ?? t.translation}
              </CategoryHeading>
              {localized(c, "description", lang) && (
                <p>{localized(c, "description", lang)}</p>
              )}
              <div className="menu-grid">
                {c.items.map((item) => (
                  <article
                    className={
                      fullPage
                        ? `menu-item menu-poster${item.imageUrl ? " has-photo" : ""}`
                        : "menu-item"
                    }
                    key={item.id}
                  >
                    {item.imageUrl && fullPage && (
                      <div className="menu-poster-photo">
                        <Image
                          src={item.imageUrl}
                          alt={localized(item, "name", lang) ?? item.nameMn}
                          sizes="(max-width: 600px) 45vw, (max-width: 1000px) 50vw, 25vw"
                          width={600}
                          height={400}
                        />
                      </div>
                    )}
                    <div
                      className={
                        fullPage ? "menu-poster-copy" : "menu-preview-copy"
                      }
                    >
                      <div className="item-title">
                        <ItemHeading>
                          {localized(item, "name", lang) ?? t.translation}
                        </ItemHeading>
                        {!fullPage && <span>{price(item.price)}</span>}
                      </div>
                      {lang !== "mn" && !localized(item, "name", lang) && (
                        <p lang="mn">{item.nameMn}</p>
                      )}
                      {fullPage && lang !== "ko" && item.nameKo && (
                        <p className="menu-korean-name" lang="ko">
                          {item.nameKo}
                        </p>
                      )}
                      {item.isFeatured && (
                        <small className="gold">{t.featured}</small>
                      )}
                      {item.size && <small>{item.size}</small>}
                      {localized(item, "description", lang) && (
                        <p>{localized(item, "description", lang)}</p>
                      )}
                      {item.variants.map((v) => (
                        <div className="variant" key={v.id}>
                          <span>
                            {localized(v, "name", lang) ?? t.translation}
                          </span>
                          <span>{price(v.price)}</span>
                        </div>
                      ))}
                      {fullPage && (
                        <div className="menu-poster-price">
                          {price(item.price)}
                        </div>
                      )}
                    </div>
                    {fullPage && item.images.length > 0 && (
                      <div className="image-strip">
                        {item.images.map((img) => (
                          <Image
                            key={img.id}
                            src={img.url}
                            alt={localized(img, "alt", lang) ?? img.altMn}
                            width={240}
                            height={180}
                          />
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      {!fullPage && allItems.length > 0 && (
        <div className="menu-expand">
          <Link href={`/${lang}/menu?group=${group}`}>
            {t.viewAll}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      )}
    </>
  );
}
