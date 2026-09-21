import { useEffect } from "react";

/**
 * useScrollReveal
 * Attaches an IntersectionObserver to all elements with className `reveal`
 * inside the given container ref (or document if null).
 *
 * Once an element enters the viewport it receives the `is-visible` class
 * which triggers the CSS transition defined in index.css.
 *
 * @param {React.RefObject|null} containerRef  – optional container ref
 * @param {number}              threshold      – intersection threshold (0-1)
 */
export function useScrollReveal(containerRef = null, threshold = 0.12) {
  useEffect(() => {
    const root = containerRef?.current ?? document;

    const targets = root.querySelectorAll(".reveal");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target); // fire once
          }
        });
      },
      { threshold }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [containerRef, threshold]);
}
