import React, { useRef, useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ManagementCommitteeCard from "./ManagementCommitteeCard";
import { realCommitteeMembers } from "../../data/bairwaData";
import { useLanguage } from "../../i18n/LanguageContext";

const ManagementCommitteeSlider = ({ members = [], title, subtitle }) => {
  const { t, isHindi } = useLanguage();
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const displayMembers = members && members.length > 0 ? members : realCommitteeMembers;

  const updateScrollState = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 240;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.min(index, displayMembers.length - 1));
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", updateScrollState, { passive: true });
      updateScrollState();
    }
    return () => {
      if (slider) slider.removeEventListener("scroll", updateScrollState);
    };
  }, [displayMembers]);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.clientWidth > 640 ? 280 : 230;
    const amount = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
    sliderRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--text-primary)]">
            {title || t("secLeadership")}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-xl">
            {subtitle || t("secLeadershipSub")}
          </p>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous Slide"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--accent-primary)]/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Next Slide"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] transition-all hover:bg-[var(--surface-hover)] hover:border-[var(--accent-primary)]/40 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={sliderRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory no-scrollbar"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {displayMembers.map((member, idx) => (
          <div
            key={member._id || idx}
            className="w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px] shrink-0 snap-start"
          >
            <ManagementCommitteeCard member={member} />
          </div>
        ))}
      </div>

      {/* Mobile Swipe Hint / Dot Track */}
      <div className="mt-4 flex items-center justify-center gap-1.5 sm:hidden">
        {displayMembers.slice(0, Math.min(displayMembers.length, 6)).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "w-5 bg-[var(--accent-primary)]"
                : "w-1.5 bg-[var(--border-subtle)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ManagementCommitteeSlider;
