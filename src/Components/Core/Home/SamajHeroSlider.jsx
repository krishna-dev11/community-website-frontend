import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * SamajHeroSlider
 * ──────────────────────────────────────────────────────────
 * Simple, clean full-width image slider for Samaj homepage.
 *
 * Images: /image-1.jpg … /image-5.jpg (place in public/)
 * No framer-motion. No fancy overlay. No large text panels.
 * Just clean images + simple arrows + pagination dots.
 */

const SLIDES = [
  { src: "/image-1.jpg", alt: "आदिवासी हलबा/हलबी समाज कल्याण समिति" },
  { src: "/image-2.png", alt: "सामाजिक कार्यक्रम एवं उत्सव" },
  { src: "/image-3.png", alt: "श्री विट्ठल-रुक्मिणी मंदिर एवं धर्मशाला धाम, उज्जैन" },
  { src: "/image-4.jpg", alt: "समाज बंधुता एवं सामुदायिक आयोजन" },
  { src: "/image-5.jpg", alt: "सांस्कृतिक विरासत एवं परंपरा" },
];

const AUTOPLAY_INTERVAL = 4500;

const SamajHeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const timerRef = useRef(null);
  const touchStartX = useRef(null);

  const goTo = useCallback((index) => {
    const next = (index + SLIDES.length) % SLIDES.length;
    setFading(true);
    setTimeout(() => {
      setCurrent(next);
      setFading(false);
    }, 220);
  }, []);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  // Autoplay
  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
  }, [next]);

  useEffect(() => {
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [resetTimer]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") { prev(); resetTimer(); }
      if (e.key === "ArrowRight") { next(); resetTimer(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next, resetTimer]);

  // Touch swipe
  const onTouchStart = (e) => { touchStartX.current = e.changedTouches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
      resetTimer();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 select-none"
      style={{ aspectRatio: "16 / 7" }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-roledescription="carousel"
      aria-label="Samaj Community Photo Slideshow"
    >
      {/* IMAGE */}
      <img
        key={current}
        src={SLIDES[current].src}
        alt={SLIDES[current].alt}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[220ms]"
        style={{ opacity: fading ? 0 : 1 }}
        draggable={false}
        onError={(e) => {
          // Show neutral dark placeholder on missing image
          e.currentTarget.style.display = "none";
        }}
      />

      {/* Neutral fallback (shows through when img fails) */}
      <div className="absolute inset-0 flex items-center justify-center bg-stone-200 dark:bg-stone-800 -z-10">
        <span className="text-stone-400 dark:text-stone-600 text-sm font-medium select-none">
          {SLIDES[current].alt}
        </span>
      </div>

      {/* Very subtle bottom gradient only to make dots readable */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

      {/* LEFT ARROW */}
      <button
        onClick={() => { prev(); resetTimer(); }}
        aria-label="Previous image"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 dark:bg-black/60 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-black/80 shadow transition-all"
      >
        <FiChevronLeft size={20} />
      </button>

      {/* RIGHT ARROW */}
      <button
        onClick={() => { next(); resetTimer(); }}
        aria-label="Next image"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/80 dark:bg-black/60 text-stone-700 dark:text-stone-200 hover:bg-white dark:hover:bg-black/80 shadow transition-all"
      >
        <FiChevronRight size={20} />
      </button>

      {/* PAGINATION DOTS */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => { goTo(i); resetTimer(); }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-white"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SamajHeroSlider;
