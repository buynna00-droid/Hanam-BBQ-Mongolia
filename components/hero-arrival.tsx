"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

export function HeroArrival() {
  const veil = useRef<HTMLDivElement>(null);
  const flight = useRef<HTMLDivElement>(null);
  const destination = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = veil.current,
      moving = flight.current,
      target = destination.current;
    if (!overlay || !moving || !target) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const animations: Animation[] = [];
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    let disposed = false;
    const finish = () => {
      stopped = true;
      clearTimeout(timer);
      animations.forEach((animation) => animation.cancel());
      overlay.hidden = true;
      moving.hidden = true;
      target.style.animation = "none";
      target.style.opacity = "1";
      if (!disposed) {
        try {
          sessionStorage.setItem("hanam-arrival", "seen");
        } catch {
          /* Optional session preference. */
        }
      }
    };
    let seen = false;
    try {
      seen = sessionStorage.getItem("hanam-arrival") === "seen";
    } catch {
      /* Animation still works with storage disabled. */
    }
    if (
      seen ||
      preference.matches ||
      window.scrollY > 80 ||
      window.location.hash
    ) {
      finish();
      return;
    }
    const begin = performance.now();
    overlay.hidden = false;
    moving.hidden = false;
    target.style.animation = "";
    target.style.opacity = "";
    const move = () => {
      if (stopped) return;
      const heroImage =
        document.querySelector<HTMLImageElement>(".hero-photo img");
      if (
        heroImage &&
        !heroImage.complete &&
        performance.now() - begin < 1800
      ) {
        timer = setTimeout(move, 100);
        return;
      }
      const from = moving.getBoundingClientRect(),
        to = target.getBoundingClientRect();
      animations.push(
        overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 850,
          fill: "forwards",
          easing: "ease",
        }),
      );
      const animation = moving.animate(
        [
          { transform: "translate(-50%, -50%)" },
          {
            transform: `translate(-50%, -50%) translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})`,
          },
        ],
        {
          duration: 1000,
          fill: "forwards",
          easing: "cubic-bezier(.22,.61,.36,1)",
        },
      );
      animations.push(animation);
      animation.onfinish = finish;
    };
    timer = setTimeout(move, 1100);
    // Scrolling, keyboard interaction or changing motion preference skips the intro.
    window.addEventListener("scroll", finish, { once: true, passive: true });
    window.addEventListener("keydown", finish, { once: true });
    window.addEventListener("resize", finish, { once: true });
    preference.addEventListener("change", finish);
    return () => {
      disposed = true;
      finish();
      window.removeEventListener("scroll", finish);
      window.removeEventListener("keydown", finish);
      window.removeEventListener("resize", finish);
      preference.removeEventListener("change", finish);
    };
  }, []);

  return (
    <>
      <div ref={destination} className="hero-arrival-logo">
        <Image
          src="/images/logo/hanam-bbq-logo.png"
          alt="Hanam BBQ Mongolia"
          width={648}
          height={212}
          sizes="(max-width: 760px) 52vw, (max-width: 1555px) 36vw, 560px"
          priority
        />
      </div>
      <div ref={veil} className="intro-veil" aria-hidden="true" />
      <div ref={flight} className="intro-logo-flight" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            className="intro-logo-piece"
            key={i}
            style={{
              left: `${i * 12.5}%`,
              backgroundPosition: `${(i / 7) * 100}% center`,
              animationDelay: `${i * 65}ms`,
            }}
          />
        ))}
      </div>
      <noscript>
        <style>{`.intro-veil,.intro-logo-flight{display:none!important}.hero-arrival-logo{opacity:1!important;animation:none!important}`}</style>
      </noscript>
    </>
  );
}
