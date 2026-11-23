"use client";

import { useEffect } from "react";

export function TextReveal() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".restaurant-site");
    if (!root || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const selector =
      "main h2, main h3, main h4, main p, main figcaption, .footer-grid > div:first-child, .footer-bottom";
    const elements = new Set<HTMLElement>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            (target as HTMLElement).dataset.reveal = "visible";
            observer.unobserve(target);
          }
        });
      },
      { rootMargin: "0px 0px -32px 0px", threshold: 0.05 },
    );

    const register = () => {
      root.querySelectorAll<HTMLElement>(selector).forEach((element) => {
        if (element.closest(".editorial")) return;
        if (elements.has(element)) return;
        elements.add(element);
        // Existing viewport content stays readable; only incoming text reveals.
        const rect = element.getBoundingClientRect();
        const visible =
          preference.matches ||
          (rect.top < window.innerHeight - 32 && rect.bottom > 0);
        element.dataset.reveal = visible ? "visible" : "pending";
        if (!visible) observer.observe(element);
      });
    };
    const showAll = () => {
      if (preference.matches) {
        elements.forEach((element) => {
          element.dataset.reveal = "visible";
        });
        observer.disconnect();
      }
    };
    const showFocused = (event: FocusEvent) => {
      if (event.target instanceof Element) {
        const element = event.target.closest<HTMLElement>(
          '[data-reveal="pending"]',
        );
        if (element) {
          element.dataset.reveal = "visible";
          observer.unobserve(element);
        }
      }
    };
    register();
    const mutations = new MutationObserver(register);
    mutations.observe(root, { childList: true, subtree: true });
    preference.addEventListener("change", showAll);
    root.addEventListener("focusin", showFocused);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      preference.removeEventListener("change", showAll);
      root.removeEventListener("focusin", showFocused);
      elements.forEach((element) => {
        delete element.dataset.reveal;
      });
    };
  }, []);

  return null;
}
