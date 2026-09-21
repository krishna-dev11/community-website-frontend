import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCalendar, FiClock } from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

/* ─────────────────────────────────────────────────────────────
   Verified historical milestones — static data (no API call)
   ───────────────────────────────────────────────────────────── */
const milestones = [
  {
    year: "1979",
    date: "14 March 1979",
    dateHi: "14 मार्च 1979",
    titleHi: "प्रथम अनौपचारिक बैठक",
    titleEn: "First Informal Meeting",
    descHi: "समाज बंधुओं की प्रथम अनौपचारिक बैठक आयोजित कर पंजीयन का प्रस्ताव सर्वसम्मति से पारित हुआ।",
    descEn: "First informal meeting held; resolution for registration unanimously approved.",
    featured: false,
  },
  {
    year: "1980",
    date: "1980",
    dateHi: "1980",
    titleHi: "इंदौर समिति से संबद्धता",
    titleEn: "Indore Samiti Affiliation",
    descHi: "उज्जैन इकाई को इंदौर समिति के अधीन शाखा के रूप में स्वीकृति प्राप्त हुई और 25 वर्षों तक सेवाएं दीं।",
    descEn: "Affiliation accepted by Indore Samiti; served actively as Ujjain branch for 25 years.",
    featured: false,
  },
  {
    year: "2004",
    date: "10 December 2004",
    dateHi: "10 दिसंबर 2004",
    titleHi: "स्वतंत्र समिति का पंजीयन",
    titleEn: "Independent Registration",
    descHi: "'आदिवासी हलबा/हलबी समाज कल्याण समिति, उज्जैन' के रूप में स्वतंत्र पंजीयन संपन्न हुआ।",
    descEn: "Formally registered as an independent body under MP Societies Act.",
    featured: false,
  },
  {
    year: "2005",
    date: "18 June 2005",
    dateHi: "18 जून 2005",
    titleHi: "धर्मशाला भूमि क्रय समझौता",
    titleEn: "Land Purchase Agreement",
    descHi: "नरसिंह घाट रोड पर धर्मशाला निर्माण हेतु भूमि क्रय अनुबंध संपन्न हुआ एवं ₹40,000 बयाना राशि दी गई।",
    descEn: "Agreement for purchasing Dharamshala land signed on Narsingh Ghat Road.",
    featured: false,
  },
  {
    year: "2006",
    date: "2006",
    dateHi: "2006",
    titleHi: "भूमि समिति के नाम पंजीकृत",
    titleEn: "Land Registry in Samiti Name",
    descHi: "धर्मशाला भूमि की विधिवत रजिस्ट्री समिति के नाम पर संपन्न हुई।",
    descEn: "Official land deed registered in the name of the Samiti.",
    featured: false,
  },
  {
    year: "2012",
    date: "4 March 2012",
    dateHi: "4 मार्च 2012",
    titleHi: "धर्मशाला भूमि पूजन",
    titleEn: "Bhumi Pujan Ceremony",
    descHi: "समाजजनों की उपस्थिति में धर्मशाला निर्माण का वैदिक विधि से भूमि पूजन संपन्न हुआ।",
    descEn: "Auspicious Bhumi Pujan ceremony performed to commence building construction.",
    featured: false,
  },
  {
    year: "2013",
    date: "27 May 2013",
    dateHi: "27 मई 2013",
    titleHi: "धर्मशाला उद्घाटन एवं मंदिर प्राण-प्रतिष्ठा",
    titleEn: "Inauguration & Consecration",
    descHi: "धर्मशाला का भव्य लोकार्पण एवं श्री विट्ठल-रुक्मिणी मंदिर की विधिवत प्राण-प्रतिष्ठा संपन्न हुई।",
    descEn: "Grand inauguration of Dharamshala and consecration of Shri Vitthal-Rukmani Mandir.",
    featured: true, // Most important milestone — slightly prominent
  },
];

/* ─── Single milestone card with IntersectionObserver ─── */
const MilestoneCard = ({ item, isLeft, isHindi }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { setVisible(true); return; }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <article
        className={`group relative rounded-2xl border bg-[var(--surface-elevated)] p-4 sm:p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${
          item.featured
            ? "border-amber-500/40 bg-gradient-to-br from-[var(--surface-elevated)] to-amber-500/5 shadow-amber-500/10"
            : "border-[var(--border-subtle)] hover:border-amber-500/30"
        }`}
      >
        {/* Featured label */}
        {item.featured && (
          <span className="absolute -top-2.5 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-black uppercase tracking-wider">
            ✦ महत्वपूर्ण पड़ाव
          </span>
        )}

        {/* Year badge */}
        <span className="inline-block font-mono text-sm font-black text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-lg bg-amber-500/12 border border-amber-500/25 mb-2.5">
          {item.year}
        </span>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-2">
          <FiCalendar size={11} />
          <span>{isHindi ? item.dateHi : item.date}</span>
        </div>

        {/* Title */}
        <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug mb-2">
          {isHindi ? item.titleHi : item.titleEn}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {isHindi ? item.descHi : item.descEn}
        </p>
      </article>
    </div>
  );
};

/* ─── Timeline dot ─── */
const TimelineDot = ({ year, isActive }) => (
  <div className="flex flex-col items-center gap-1 shrink-0">
    <div
      className={`w-4 h-4 rounded-full border-2 transition-colors duration-300 ${
        isActive
          ? "border-amber-500 bg-amber-500 shadow-[0_0_0_4px_rgba(245,158,11,0.2)]"
          : "border-amber-400/50 bg-[var(--surface-elevated)]"
      }`}
    />
  </div>
);

const HomeHistoryTimeline = () => {
  const { isHindi } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(-1);
  const dotRefs = useRef([]);

  // Track which milestone is in view for dot highlighting
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const observers = milestones.map((_, idx) => {
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveIndex(idx); },
        { threshold: 0.5, rootMargin: "-20% 0px -20% 0px" }
      );
      if (dotRefs.current[idx]) observer.observe(dotRefs.current[idx]);
      return observer;
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="py-10 sm:py-14 relative overflow-hidden">
      {/* Very subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        aria-hidden="true"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            var(--text-primary) 0px,
            var(--text-primary) 1px,
            transparent 1px,
            transparent 20px
          )`,
        }}
      />

      {/* ── Section Heading ── */}
      <div className="text-center max-w-3xl mx-auto mb-12 relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3">
          <FiClock size={13} />
          <span>{isHindi ? "संस्था की ऐतिहासिक यात्रा" : "Historic Journey"}</span>
          <span>❖</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          {isHindi ? "हमारी यात्रा — 1979 से आज तक" : "Our Journey — 1979 to Present"}
        </h2>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mt-3 text-amber-500/60">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
          <span className="text-xs tracking-[0.4em]">♦ ❖ ♦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
        </div>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
          {isHindi
            ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन की गौरवमयी ऐतिहासिक यात्रा"
            : "The glorious historical journey of Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain"}
        </p>
      </div>

      {/* ── DESKTOP: Alternating Left/Right Timeline ── */}
      <div className="hidden md:block relative z-10">
        {/* Vertical center line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" aria-hidden="true" />

        <div className="space-y-8">
          {milestones.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            return (
              <div
                key={idx}
                ref={(el) => { dotRefs.current[idx] = el; }}
                className="relative grid grid-cols-[1fr_auto_1fr] gap-6 items-center"
              >
                {/* Left card or spacer */}
                <div className={isLeft ? "" : "invisible"}>
                  {isLeft && <MilestoneCard item={item} isLeft={true} isHindi={isHindi} />}
                </div>

                {/* Center dot + year */}
                <div className="flex flex-col items-center gap-1.5">
                  <TimelineDot year={item.year} isActive={activeIndex === idx} />
                  <span className="font-mono text-xs font-black text-amber-600/80 dark:text-amber-400/80">
                    {item.year}
                  </span>
                </div>

                {/* Right card or spacer */}
                <div className={!isLeft ? "" : "invisible"}>
                  {!isLeft && <MilestoneCard item={item} isLeft={false} isHindi={isHindi} />}
                </div>
              </div>
            );
          })}
        </div>

        {/* "Continuing" end block */}
        <div className="relative flex flex-col items-center mt-8">
          <div className="w-px h-8 bg-gradient-to-b from-amber-400/40 to-transparent" />
          <div className="w-5 h-5 rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-amber-400/50" />
          </div>
        </div>
      </div>

      {/* ── MOBILE: Single column vertical timeline ── */}
      <div className="block md:hidden relative z-10">
        {/* Vertical line on left side */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" aria-hidden="true" />

        <div className="space-y-6 pl-10">
          {milestones.map((item, idx) => (
            <div key={idx} className="relative">
              {/* Dot on the line */}
              <div className="absolute -left-[26px] top-5 w-3.5 h-3.5 rounded-full border-2 border-amber-500 bg-[var(--surface-elevated)] z-10" />
              <MilestoneCard item={item} isLeft={true} isHindi={isHindi} />
            </div>
          ))}
        </div>

        {/* End dot */}
        <div className="relative pl-10 mt-4">
          <div className="absolute -left-[26px] top-2 w-3.5 h-3.5 rounded-full border-2 border-dashed border-amber-400/50 bg-[var(--surface-elevated)] z-10" />
        </div>
      </div>

      {/* ── Continuing journey block ── */}
      <div className="relative z-10 mt-10 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-emerald-500/5 p-5 sm:p-6 text-center">
          <div className="text-2xl mb-2" aria-hidden="true">🌿</div>
          <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] mb-2">
            {isHindi ? "आज तक की यात्रा" : "The Journey Continues"}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {isHindi
              ? "यह यात्रा आज भी जारी है — सामुदायिक सेवा, सामाजिक एकता, शिक्षा, सांस्कृतिक परंपराओं के संरक्षण और सामूहिक विकास के माध्यम से।"
              : "This journey continues today — through community service, social unity, education, preservation of cultural traditions and collective development."}
          </p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="mt-8 text-center relative z-10">
        <Link
          to="/history"
          className="btn-primary !py-2.5 !px-6 !text-sm inline-flex items-center gap-2"
        >
          <span>{isHindi ? "पूरा इतिहास पढ़ें" : "Read Full History"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default HomeHistoryTimeline;
