"use client";

import { useState } from "react";
import { branchMaps } from "@/lib/locations";
import { copy, type Lang } from "@/lib/content";

export function BranchMap({ lang }: { lang: Lang }) {
  const [selected, setSelected] = useState(0);
  const branch = branchMaps[selected];
  return (
    <div className="branch-map">
      <div
        className="branch-map-selector"
        role="group"
        aria-label={copy[lang].branches}
      >
        {branchMaps.map((item, index) => (
          <button
            key={item.name}
            type="button"
            aria-pressed={index === selected}
            aria-controls="branch-map-frame"
            onClick={() => setSelected(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <iframe
        id="branch-map-frame"
        src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&z=17&hl=${lang}&output=embed`}
        title={`Hanam BBQ — ${branch.name} · ${copy[lang].branches}`}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
      <a href={branch.url} target="_blank" rel="noopener noreferrer">
        Hanam BBQ · {branch.name} ↗
      </a>
    </div>
  );
}
