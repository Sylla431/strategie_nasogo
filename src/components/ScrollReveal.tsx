"use client";

import { useEffect, useRef, useState } from "react";
import type { ElementType, ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Délai de déclenchement en ms, utile pour un effet en cascade sur une grille */
  delayMs?: number;
  as?: ElementType;
  id?: string;
  /** Désactive le déplacement vertical (garde uniquement le fondu) — utile pour les conteneurs en position sticky */
  translate?: boolean;
};

export default function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
  as: Tag = "div",
  id,
  translate = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hiddenState = translate ? "opacity-0 translate-y-6" : "opacity-0";
  const shownState = translate ? "opacity-100 translate-y-0" : "opacity-100";

  return (
    <Tag
      ref={ref}
      id={id}
      className={`transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        visible ? shownState : hiddenState
      } ${className}`}
      style={{ transitionDelay: visible ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
