"use client";

import { useEffect, useRef, useState } from "react";
import ServiceCard from "./ServiceCard";

type Service = Parameters<typeof ServiceCard>[0]["service"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function ServicesCarousel({ services }: { services: Service[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const items = itemRefs.current.filter((el): el is HTMLDivElement => !!el);
    if (!scroller || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const idx = items.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setActiveIndex(idx);
          }
        });
      },
      { root: scroller, threshold: [0.6] }
    );

    items.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [services.length]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const updateArrowState = () => {
      setCanScrollPrev(scroller.scrollLeft > 8);
      setCanScrollNext(
        scroller.scrollLeft < scroller.scrollWidth - scroller.clientWidth - 8
      );
    };

    updateArrowState();
    scroller.addEventListener("scroll", updateArrowState, { passive: true });
    window.addEventListener("resize", updateArrowState);
    return () => {
      scroller.removeEventListener("scroll", updateArrowState);
      window.removeEventListener("resize", updateArrowState);
    };
  }, [services.length]);

  // Grossit la carte la plus proche du centre pendant le défilement (effet "coverflow")
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || prefersReducedMotion()) return;

    let rafId: number | null = null;

    const applyScale = () => {
      rafId = null;
      const scrollerRect = scroller.getBoundingClientRect();
      const center = scrollerRect.left + scrollerRect.width / 2;

      itemRefs.current.forEach((item) => {
        if (!item) return;
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - center);
        const maxDistance = scrollerRect.width / 2 + rect.width / 2;
        const proximity = Math.max(0, 1 - distance / maxDistance);
        const scale = 0.94 + proximity * 0.12;
        item.style.transform = `scale(${scale})`;
      });
    };

    const onScroll = () => {
      if (rafId == null) rafId = requestAnimationFrame(applyScale);
    };

    applyScale();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [services.length]);

  const scrollToIndex = (index: number) => {
    itemRefs.current[index]?.scrollIntoView({
      behavior: prefersReducedMotion() ? "auto" : "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const scrollByOffset = (direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    const firstItem = itemRefs.current[0];
    if (!scroller || !firstItem) return;
    const gap = 24;
    const amount = firstItem.getBoundingClientRect().width + gap;
    scroller.scrollBy({
      left: amount * direction,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  };

  return (
    <div>
      <div className="relative">
        <div
          ref={scrollerRef}
          role="region"
          aria-label="Liste des services, faites défiler horizontalement"
          tabIndex={0}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth py-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {services.map((service, index) => (
            <div
              key={service.id}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              className="snap-center shrink-0 w-[85%] origin-center transition-transform duration-150 ease-out sm:w-[47%] lg:w-[31%]"
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        {/* Dégradés de bord signalant qu'il y a plus de services à découvrir */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 left-0 top-3 bottom-3 w-6 sm:w-10 bg-gradient-to-r from-white to-transparent transition-opacity duration-300 ${
            canScrollPrev ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-y-0 right-0 top-3 bottom-3 w-6 sm:w-10 bg-gradient-to-l from-white to-transparent transition-opacity duration-300 ${
            canScrollNext ? "opacity-100" : "opacity-0"
          }`}
        />

        <button
          type="button"
          onClick={() => scrollByOffset(-1)}
          disabled={!canScrollPrev}
          aria-label="Service précédent"
          className="hidden sm:flex absolute left-0 top-[38%] -translate-y-1/2 -translate-x-4 h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition-opacity hover:bg-neutral-50 disabled:opacity-0 disabled:pointer-events-none"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollByOffset(1)}
          disabled={!canScrollNext}
          aria-label="Service suivant"
          className="hidden sm:flex absolute right-0 top-[38%] -translate-y-1/2 translate-x-4 h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-md transition-opacity hover:bg-neutral-50 disabled:opacity-0 disabled:pointer-events-none"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-1 flex justify-center gap-1">
        {services.map((service, index) => (
          <button
            key={service.id}
            type="button"
            onClick={() => scrollToIndex(index)}
            aria-label={`Aller au service ${index + 1} : ${service.name}`}
            aria-current={index === activeIndex}
            className="flex h-11 w-11 items-center justify-center"
          >
            <span
              className={`block h-2.5 rounded-full transition-all ${
                index === activeIndex ? "w-6 bg-brand" : "w-2.5 bg-neutral-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
