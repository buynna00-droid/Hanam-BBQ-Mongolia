"use client";

import { useEffect, useRef } from "react";

export function ScrollBackground() {
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = layer.current;
    if (!element) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let position = 0;
    let target = 0;
    let lastTime = 0;

    const animate = (time: number) => {
      const elapsed = lastTime ? Math.min(time - lastTime, 64) : 16;
      lastTime = time;
      position += (target - position) * (1 - Math.exp(-elapsed / 75));
      if (Math.abs(target - position) < 0.1) position = target;
      element.style.transform = `translate3d(0, ${position.toFixed(2)}px, 0)`;
      frame = position === target ? 0 : window.requestAnimationFrame(animate);
    };
    const update = () => {
      if (reducedMotion.matches) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        position = target = 0;
        element.style.transform = "none";
        return;
      }
      const range = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const progress = Math.max(0, Math.min(1, window.scrollY / range));
      target = -150 + progress * 300;
      if (!frame) {
        lastTime = 0;
        frame = window.requestAnimationFrame(animate);
      }
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <div ref={layer} className="restaurant-background" aria-hidden="true" />
  );
}
