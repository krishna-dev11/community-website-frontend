import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiAward, FiChevronLeft, FiChevronRight, FiHeart, FiUser } from "react-icons/fi";

const formatAmount = (value) => {
  if (!value) return "Contribution received";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
};

const ShowcaseCard = ({ item, type }) => {
  const isSupporter = type === "supporters";
  const photoUrl = isSupporter ? item.donorPhoto : item.recipientPhoto?.url || item.image?.url;
  const title = isSupporter ? item.donorName : item.achieverName;
  const subtitle = isSupporter ? formatAmount(item.amount) : item.title;
  const meta = isSupporter
    ? item.campaignTitle
    : [item.organization, item.year].filter(Boolean).join(" · ");
  const description = isSupporter ? item.note || "Together, we make a difference." : item.description;
  const Icon = isSupporter ? FiHeart : FiAward;

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5 shadow-md transition-all hover:border-[var(--accent-primary)]/40 hover:shadow-lg">
      <div className="relative aspect-[9/12] overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-inner">
        {photoUrl ? (
          <img src={photoUrl} alt={title} loading="lazy" className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[var(--surface-raised)] to-[var(--surface)] text-[var(--text-muted)]">
            <FiUser size={36} />
          </div>
        )}
        <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-16px)] items-center gap-1 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
          <Icon size={9} />
          {isSupporter ? "Community Supporter" : "Samaj Pride"}
        </span>
      </div>

      <div className="mt-3 min-w-0">
        <h3 className="truncate text-sm font-black text-[var(--text-primary)]" title={title}>{title}</h3>
        <p className="mt-0.5 truncate text-xs font-bold text-[var(--accent-primary)]" title={subtitle}>{subtitle}</p>
        {meta && <p className="mt-0.5 truncate text-[10px] text-[var(--text-muted)]">{meta}</p>}
        {description && <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-[var(--text-secondary)]">{description}</p>}
      </div>
    </article>
  );
};

const DynamicShowcaseSlider = ({ title, subtitle, items = [], type, cta }) => {
  const sliderRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const scroll = (direction) => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.clientWidth > 640 ? 280 : 230;
    sliderRef.current.scrollBy({ left: direction === "left" ? -cardWidth * 2 : cardWidth * 2, behavior: "smooth" });
  };

  useEffect(() => {
    if (items.length <= 1 || paused) return undefined;
    const timer = window.setInterval(() => {
      const slider = sliderRef.current;
      if (!slider) return;
      const nearEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 20;
      if (nearEnd) slider.scrollTo({ left: 0, behavior: "smooth" });
      else scroll("right");
    }, 5000);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;
    const onScroll = () => setActiveIndex(Math.round(slider.scrollLeft / 240));
    slider.addEventListener("scroll", onScroll, { passive: true });
    return () => slider.removeEventListener("scroll", onScroll);
  }, []);

  if (!items.length) return null;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)] sm:text-3xl">{title}</h2>
          <p className="mt-1 max-w-xl text-xs text-[var(--text-secondary)] sm:text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {cta && <Link to={cta.to} className="btn-secondary !py-2 !px-4 !text-xs">{cta.label}</Link>}
          <button type="button" onClick={() => scroll("left")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40">
            <FiChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => scroll("right")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]/40">
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      <div ref={sliderRef} className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 pt-1">
        {items.map((item, index) => (
          <div key={item._id || index} className="w-[220px] shrink-0 snap-start sm:w-[240px] md:w-[260px]">
            <ShowcaseCard item={item} type={type} />
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 sm:hidden">
        {items.slice(0, Math.min(items.length, 6)).map((_, index) => (
          <span key={index} className={`h-1.5 rounded-full ${activeIndex === index ? "w-5 bg-[var(--accent-primary)]" : "w-1.5 bg-[var(--border-subtle)]"}`} />
        ))}
      </div>
    </div>
  );
};

export default DynamicShowcaseSlider;
