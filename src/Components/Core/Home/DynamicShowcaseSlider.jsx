import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiAward, FiChevronLeft, FiChevronRight, FiHeart, FiUser } from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

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
          <img src={photoUrl} alt={title} loading="lazy" className="h-full w-full bg-white object-contain transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[var(--surface-raised)] to-[var(--surface)] text-[var(--text-muted)]">
            <FiUser size={36} />
          </div>
        )}
        {/* <span className="absolute left-2 top-2 inline-flex max-w-[calc(100%-16px)] items-center gap-1 rounded-md border border-white/10 bg-black/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 backdrop-blur-md">
          <Icon size={9} />
          {isSupporter ? "Community Supporter" : "Samaj Pride"}
        </span> */}
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

  const { isHindi } = useLanguage();

  if (!items.length) {
    const isAchievements = type === "achievements";
    const isSupporters = type === "supporters";
    const EmptyIcon = isSupporters ? FiHeart : isAchievements ? FiAward : FiUser;
    const badgeColor = isSupporters
      ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
      : "bg-amber-500/10 text-amber-500 border-amber-500/20";
    const btnColor = isSupporters
      ? "bg-rose-600 hover:bg-rose-500 text-white"
      : "bg-amber-600 hover:bg-amber-500 text-white";

    return (
      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[var(--text-primary)] sm:text-3xl">{title}</h2>
            <p className="mt-1 max-w-xl text-xs text-[var(--text-secondary)] sm:text-sm">{subtitle}</p>
          </div>
          {cta && (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link to={cta.to} className="btn-secondary !py-2 !px-4 !text-xs">
                {cta.label}
              </Link>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full border ${badgeColor} mb-3`}>
            <EmptyIcon size={22} />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)]">
            {isSupporters
              ? isHindi
                ? "वर्तमान में कोई दानदाता प्रविष्टि उपलब्ध नहीं है।"
                : "No contributor records available right now."
              : isAchievements
              ? isHindi
                ? "वर्तमान में कोई उपलब्धि प्रकाशित नहीं है।"
                : "No achievements listed currently."
              : isHindi
              ? "वर्तमान में कोई प्रविष्टि उपलब्ध नहीं है।"
              : "No records available right now."}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)] max-w-md">
            {isSupporters
              ? isHindi
                ? "समाज स्वास्थ्य सहायता एवं जनकल्याण अभियान में अपना सहयोग देकर इस गौरव सूची का हिस्सा बनें।"
                : "Contribute to healthcare assistance and community welfare funds to be recognized here."
              : isAchievements
              ? isHindi
                ? "समाज के प्रतिभाशाली सदस्य, विद्यार्थी व विशिष्ट व्यक्तित्व अपनी उपलब्धियां साझा कर सकते हैं।"
                : "Community achievers, students, and professionals are invited to share their accomplishments."
              : isHindi
              ? "नई प्रविष्टियाँ प्रकाशित होते ही यहाँ प्रदर्शित की जाएंगी।"
              : "New entries will appear here once published."}
          </p>
          {cta && (
            <Link
              to={cta.to}
              className={`mt-4 inline-flex items-center gap-1.5 rounded-xl ${btnColor} px-4 py-2 text-xs font-bold shadow transition-colors`}
            >
              <span>{cta.label}</span>
              <FiChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>
    );
  }

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
