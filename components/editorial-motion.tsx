"use client";

import { useEffect } from "react";

export function EditorialMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".restaurant-site");
    if (!root) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const blocks = Array.from(
      root.querySelectorAll<HTMLElement>(
        ".editorial > .photo > .photo-img, .editorial > .photo > .photo-placeholder, .editorial > .editorial-copy",
      ),
    ).map((element) => ({
      element,
      direction:
        element.classList.contains("photo-img") ||
        element.classList.contains("photo-placeholder")
          ? -1
          : 1,
      current: 1,
      target: 1,
    }));
    let frame = 0;
    let lastTime = 0;
    let needsMeasure = true;
    let distance = 72;

    const paint = (block: (typeof blocks)[number]) => {
      const faded = 1 - block.current;
      block.element.style.setProperty(
        "--editorial-shift",
        `${(block.direction * distance * faded).toFixed(2)}px`,
      );
      block.element.style.setProperty(
        "--editorial-opacity",
        (1 - faded * 0.94).toFixed(3),
      );
      block.element.style.setProperty(
        "--editorial-blur",
        `${(faded * 6).toFixed(2)}px`,
      );
    };
    const measure = () => {
      const height = window.innerHeight;
      distance = window.innerWidth <= 760 ? 32 : 72;
      const ramp = Math.min(300, height * 0.32);
      // Measure before painting; horizontal movement cannot affect these bounds.
      const bounds = blocks.map((block) =>
        block.element.getBoundingClientRect(),
      );
      blocks.forEach((block, index) => {
        const rect = bounds[index];
        const progress = Math.max(
          0,
          Math.min(1, (height - rect.top) / ramp, rect.bottom / ramp),
        );
        block.target =
          preference.matches || block.element.contains(document.activeElement)
            ? 1
            : progress * progress * (3 - 2 * progress);
      });
      needsMeasure = false;
    };
    const animate = (time: number) => {
      if (needsMeasure) {
        measure();
        blocks.forEach(paint);
      }
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      let unsettled = false;
      blocks.forEach((block) => {
        const previous = block.current;
        block.current +=
          (block.target - block.current) * (1 - Math.exp(-elapsed / 160));
        if (Math.abs(block.target - block.current) < 0.001)
          block.current = block.target;
        if (previous !== block.current) paint(block);
        if (block.current !== block.target) unsettled = true;
      });
      frame = unsettled ? window.requestAnimationFrame(animate) : 0;
    };
    const update = () => {
      needsMeasure = true;
      if (document.hidden || preference.matches) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        if (preference.matches)
          blocks.forEach((block) => {
            block.current = block.target = 1;
            paint(block);
          });
        return;
      }
      if (!frame) {
        lastTime = 0;
        frame = window.requestAnimationFrame(animate);
      }
    };

    measure();
    blocks.forEach((block) => {
      block.element.dataset.editorialMotion = "";
      block.current = block.target;
      paint(block);
    });
    const resize = new ResizeObserver(update);
    blocks.forEach((block) => resize.observe(block.element));
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    root.addEventListener("focusin", update);
    root.addEventListener("focusout", update);
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.cancelAnimationFrame(frame);
      resize.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      root.removeEventListener("focusin", update);
      root.removeEventListener("focusout", update);
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      blocks.forEach(({ element }) => {
        delete element.dataset.editorialMotion;
        [
          "--editorial-shift",
          "--editorial-opacity",
          "--editorial-blur",
        ].forEach((property) => element.style.removeProperty(property));
      });
    };
  }, []);

  return null;
}
