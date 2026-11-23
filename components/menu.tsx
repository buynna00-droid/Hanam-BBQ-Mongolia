"use client";
import { useState } from "react";
import Image from "next/image";
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
}: {
  categories: Category[];
  lang: Lang;
}) {
  const [group, setGroup] = useState("FOOD");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const t = copy[lang];
  const visible = categories.filter((c) => c.group === group);
  const allItems = visible.flatMap((category) => category.items);
  const previewIds = new Set(allItems.slice(0, 10).map((item) => item.id));
  const shownCategories = visible
    .filter((category) => filter === "all" || category.id === filter)
    .map((category) => ({
      ...category,
      items:
        filter === "all" && !expanded
          ? category.items.filter((item) => previewIds.has(item.id))
          : category.items,
    }))
    .filter((category) => category.items.length > 0);
  const price = (p: number | null) =>
    p === null
      ? t.price
      : new Intl.NumberFormat(
          lang === "mn" ? "mn-MN" : lang === "ko" ? "ko-KR" : "en-US",
        ).format(p) + " ₮";
  return (
    <>
      <div className="menu-tabs" role="group" aria-label={t.menu}>
        {["FOOD", "DRINKS"].map((g) => (
          <button
            key={g}
            aria-pressed={group === g}
            onClick={() => {
              setGroup(g);
              setFilter("all");
              setExpanded(false);
            }}
          >
            {g === "FOOD" ? t.food : t.drinks}
          </button>
        ))}
      </div>
      <div className="category-filters">
        <button
          aria-pressed={filter === "all"}
          onClick={() => {
            setFilter("all");
            setExpanded(false);
          }}
        >
          {t.all}
        </button>
        {visible.map((c) => (
          <button
            key={c.id}
            aria-pressed={filter === c.id}
            onClick={() => {
              setFilter(c.id);
              setExpanded(false);
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
              <h3>{localized(c, "name", lang) ?? t.translation}</h3>
              {localized(c, "description", lang) && (
                <p>{localized(c, "description", lang)}</p>
              )}
              <div className="menu-grid">
                {c.items.map((item) => (
                  <article className="menu-item" key={item.id}>
                    {item.imageUrl && (
                      <Image
                        src={item.imageUrl}
                        alt={localized(item, "name", lang) ?? item.nameMn}
                        width={600}
                        height={400}
                      />
                    )}
                    <div className="item-title">
                      <h4>{localized(item, "name", lang) ?? t.translation}</h4>
                      <span>{price(item.price)}</span>
                    </div>
                    {lang !== "mn" && !localized(item, "name", lang) && (
                      <p lang="mn">{item.nameMn}</p>
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
                    {item.images.length > 0 && (
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
      {filter === "all" && allItems.length > 10 && (
        <div className="menu-expand">
          <span aria-live="polite">
            {expanded ? allItems.length : 10} / {allItems.length}
          </span>
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls="menu-results"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? t.showLess : t.viewAll}
            <span aria-hidden="true">{expanded ? "−" : "+"}</span>
          </button>
        </div>
      )}
    </>
  );
}
