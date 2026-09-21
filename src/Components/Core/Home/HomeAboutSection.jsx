import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiCalendar,
  FiTarget,
  FiUsers,
  FiBookOpen,
  FiHeart,
  FiStar,
  FiFeather,
  FiGlobe,
} from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

/* ─── Scroll-reveal hook using IntersectionObserver ─── */
const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
};

/* ─── Community Identity Features (SAMAJ - not Samiti) ─── */
const samajFeatures = [
  { icon: FiStar,    hiLabel: "हमारी पहचान",         enLabel: "Our Identity" },
  { icon: FiFeather, hiLabel: "हमारी संस्कृति",       enLabel: "Our Culture" },
  { icon: FiGlobe,   hiLabel: "हमारी परंपराएँ",      enLabel: "Our Traditions" },
  { icon: FiUsers,   hiLabel: "हमारी एकता",           enLabel: "Our Unity" },
  { icon: FiHeart,   hiLabel: "हमारी विरासत",         enLabel: "Our Heritage" },
  { icon: FiBookOpen,hiLabel: "नई पीढ़ी और शिक्षा",  enLabel: "Youth & Education" },
];

/* ─── Samiti 10 objectives (verified data) ─── */
const samitiFocusAreas = [
  { hi: "सामाजिक उत्थान",               en: "Social Upliftment" },
  { hi: "शैक्षणिक सहायता",              en: "Educational Assistance" },
  { hi: "स्वास्थ्य सहायता",             en: "Health Support" },
  { hi: "शासकीय सहायता व योजनाएँ",      en: "Government Scheme Facilitation" },
  { hi: "आर्थिक स्वावलंबन",             en: "Economic Assistance" },
  { hi: "पारस्परिक सामाजिक सहयोग",      en: "Social Support Network" },
  { hi: "परंपराओं का संरक्षण",          en: "Preservation of Traditions" },
  { hi: "सामुदायिक एकता व बंधुत्व",     en: "Community Unity" },
  { hi: "संवैधानिक अधिकारों की चेतना", en: "Awareness of Rights" },
  { hi: "सामूहिक सामाजिक कार्यक्रम",   en: "Social Programs & Gatherings" },
];

const HomeAboutSection = () => {
  const { isHindi } = useLanguage();
  const [samajRef, samajVisible] = useReveal(0.1);
  const [samitiBannerRef, samitiBannerVisible] = useReveal(0.1);
  const [samitiGridRef, samitiGridVisible] = useReveal(0.05);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1 — हमारे समाज के बारे में
          Community / Identity / Culture / Heritage
          ══════════════════════════════════════════════════════════════ */}
      <section
        ref={samajRef}
        className="py-10 sm:py-14"
        style={{
          opacity: samajVisible ? 1 : 0,
          transform: samajVisible ? "translateY(0)" : "translateY(28px)",
          transition: "opacity 0.6s ease-out, transform 0.6s ease-out",
        }}
      >
        {/* Section heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-3">
            <span>❖</span>
            <span>{isHindi ? "हमारी पहचान एवं विरासत" : "Our Identity & Heritage"}</span>
            <span>❖</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            {isHindi ? "हमारे समाज के बारे में" : "About Our Samaj"}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3 text-amber-500/60">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-xs">♦ ❖ ♦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left — Cultural Heritage Image */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md rounded-3xl border-2 border-emerald-500/20 bg-[var(--surface-elevated)] overflow-hidden shadow-xl group hover:border-emerald-500/40 transition-all duration-500">
              {/* Heritage image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src="/images/tribal_heritage.jpg"
                  alt="आदिवासी हल्बा/हल्बी समाज की सांस्कृतिक विरासत"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.classList.add("min-h-[200px]", "flex", "items-center", "justify-center", "bg-gradient-to-br", "from-emerald-900/30", "to-amber-900/20");
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 block mb-0.5">
                    सांस्कृतिक धरोहर
                  </span>
                  <p className="text-sm font-bold">
                    आदिवासी हल्बा/हल्बी समाज की पावन संस्कृति
                  </p>
                </div>
              </div>

              {/* Bottom accent strip */}
              <div className="px-4 py-3 bg-gradient-to-r from-emerald-500/10 to-amber-500/10 border-t border-emerald-500/20 flex items-center gap-2">
                <span className="text-emerald-500 text-lg">🌿</span>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {isHindi
                    ? "परंपरा, संस्कृति और सामुदायिक भावना का अनूठा संगम"
                    : "A unique confluence of tradition, culture and community spirit"}
                </p>
              </div>
            </div>
          </div>

          {/* Right — Identity Content */}
          <div className="lg:col-span-7 space-y-6">
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "आदिवासी हल्बा/हल्बी समाज अपनी समृद्ध सांस्कृतिक विरासत, परंपराओं, सामाजिक एकता और सामुदायिक भावना के लिए जाना जाता है। हमारी पहचान हमारी भाषा, लोक परंपराओं, रीति-रिवाजों, पारिवारिक मूल्यों और आपसी भाईचारे से जुड़ी है। समाज की सांस्कृतिक धरोहर को आने वाली पीढ़ियों तक सुरक्षित रखना और शिक्षा, जागरूकता तथा सामाजिक एकता को बढ़ावा देना हमारी सामूहिक जिम्मेदारी है।"
                : "The Adivasi Halba/Halbi Samaj is known for its rich cultural heritage, traditions, social unity and community spirit. Our identity is rooted in our language, folk traditions, customs, family values and mutual brotherhood. Preserving the cultural heritage for future generations and promoting education, awareness and social unity is our collective responsibility."}
            </p>

            {/* 6 Identity Feature Pills */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
                <span>❖</span>
                <span>{isHindi ? "समाज की विशेषताएँ" : "Community Characteristics"}</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {samajFeatures.map((feat, idx) => {
                  const Icon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-emerald-500/40 hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                      style={{
                        transitionDelay: `${idx * 60}ms`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Icon size={15} className="text-emerald-500" />
                      </div>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        {isHindi ? feat.hiLabel : feat.enLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-1">
              <Link
                to="/culture"
                className="btn-primary !py-2.5 !px-6 !text-sm inline-flex items-center gap-2 shadow-md"
              >
                <span>{isHindi ? "समाज की संस्कृति जानें" : "Explore Samaj Culture"}</span>
                <FiArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Heritage Divider ── */}
      <div className="relative flex items-center justify-center py-2 my-2" aria-hidden="true">
        <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="relative px-6 bg-[var(--bg)] text-amber-500/50 text-base tracking-[0.6em] select-none">
          ॥ ❖ ✦ ❖ ॥
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2 — समिति के बारे में
          Organization / Mission / Objectives / Social Work
          ══════════════════════════════════════════════════════════════ */}
      <section className="py-10 sm:py-14">
        {/* Section heading */}
        <div
          ref={samitiBannerRef}
          className="text-center max-w-3xl mx-auto mb-10"
          style={{
            opacity: samitiBannerVisible ? 1 : 0,
            transform: samitiBannerVisible ? "translateY(0)" : "translateY(24px)",
            transition: "opacity 0.55s ease-out, transform 0.55s ease-out",
          }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-3">
            <span>❖</span>
            <span>{isHindi ? "हमारी संस्था एवं संकल्प" : "Our Organization & Mission"}</span>
            <span>❖</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)]">
            {isHindi ? "समिति के बारे में" : "About the Samiti"}
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3 text-amber-500/60">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-xs">♦ ❖ ♦</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed max-w-2xl mx-auto">
            {isHindi
              ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन — समाज के सामाजिक, शैक्षणिक, सांस्कृतिक एवं सामुदायिक विकास के लिए समर्पित एक पंजीकृत सामाजिक संस्था है।"
              : "Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain — a registered social organization dedicated to the social, educational, cultural and community development of the Samaj."}
          </p>
        </div>

        {/* Two-column: Org Info Card + Mission text */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10">
          {/* Left — Organization Info Card */}
          <div
            ref={samitiBannerRef}
            className="lg:col-span-5"
            style={{
              opacity: samitiBannerVisible ? 1 : 0,
              transform: samitiBannerVisible ? "translateX(0)" : "translateX(-24px)",
              transition: "opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s",
            }}
          >
            <div className="rounded-2xl border-2 border-amber-500/25 bg-[var(--surface-elevated)] overflow-hidden shadow-lg">
              {/* Card header */}
              <div className="px-5 py-4 bg-gradient-to-r from-amber-500/15 to-emerald-500/10 border-b border-amber-500/20 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-amber-500/20 border border-amber-400/30 flex items-center justify-center p-2 shrink-0">
                  <img
                    src="/logo.png"
                    alt="Samiti Logo"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                    {isHindi ? "पंजीकृत सामाजिक संस्था" : "Registered Social Organization"}
                  </p>
                  <h3 className="text-sm font-black text-[var(--text-primary)] leading-snug">
                    {isHindi ? "संस्था विवरण" : "Organization Details"}
                  </h3>
                </div>
              </div>

              {/* Info rows */}
              <div className="divide-y divide-[var(--border-subtle)]">
                {[
                  {
                    icon: FiUsers,
                    label: isHindi ? "संस्था का नाम" : "Organization Name",
                    value: isHindi
                      ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन"
                      : "Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain",
                  },
                  {
                    icon: FiMapPin,
                    label: isHindi ? "स्थान" : "Location",
                    value: isHindi ? "उज्जैन (म.प्र.)" : "Ujjain, Madhya Pradesh",
                  },
                  {
                    icon: FiCalendar,
                    label: isHindi ? "पंजीयन" : "Registration Date",
                    value: "10.12.2004",
                  },
                  {
                    icon: FiTarget,
                    label: isHindi ? "उद्देश्य" : "Mission",
                    value: isHindi
                      ? "सामाजिक उत्थान, शिक्षा, स्वास्थ्य, संस्कृति संरक्षण एवं सामुदायिक एकता"
                      : "Social upliftment, education, health, cultural preservation & community unity",
                  },
                ].map((row, idx) => {
                  const Icon = row.icon;
                  return (
                    <div key={idx} className="flex gap-3 items-start px-5 py-3.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={13} className="text-amber-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-0.5">{row.label}</p>
                        <p className="text-xs sm:text-sm text-[var(--text-primary)] font-semibold leading-snug">{row.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right — Mission description */}
          <div
            className="lg:col-span-7 space-y-4 pt-2"
            style={{
              opacity: samitiBannerVisible ? 1 : 0,
              transform: samitiBannerVisible ? "translateX(0)" : "translateX(24px)",
              transition: "opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s",
            }}
          >
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "समिति समाज के परिवारों और बंधुओं के सर्वांगीण सामाजिक उत्थान, शिक्षा एवं स्वास्थ्य सहायता, शासकीय योजनाओं की जानकारी, सामाजिक एकता तथा सांस्कृतिक परंपराओं के संरक्षण के लिए निरंतर कार्य करती है।"
                : "The Samiti continuously works for the holistic social upliftment of community families, educational and health assistance, government scheme awareness, social unity and preservation of cultural traditions."}
            </p>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "वर्ष 1979 में प्रारंभ हुई इस सामाजिक यात्रा ने 2004 में स्वतंत्र पंजीयन के साथ एक नया आयाम प्राप्त किया। धर्मशाला निर्माण, मंदिर प्राण-प्रतिष्ठा और अनेक सामाजिक आयोजनों के माध्यम से समिति ने समाज की एकता को सशक्त किया है।"
                : "This social journey, which began in 1979, gained a new dimension with independent registration in 2004. Through Dharamshala construction, temple consecration and numerous community programs, the Samiti has strengthened community unity."}
            </p>

            {/* Quick stat pills (non-statistical — organizational facts only) */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { hi: "पंजीकृत संस्था", en: "Registered Body" },
                { hi: "उज्जैन, म.प्र.", en: "Ujjain, M.P." },
                { hi: "सन् 1979 से सेवारत", en: "Serving since 1979" },
              ].map((tag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/25 bg-amber-500/8 text-xs font-semibold text-amber-600 dark:text-amber-400"
                >
                  <FiCheckCircle size={11} />
                  {isHindi ? tag.hi : tag.en}
                </span>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/about"
                className="btn-secondary !py-2.5 !px-6 !text-sm inline-flex items-center gap-2"
              >
                <span>{isHindi ? "समिति का पूरा परिचय" : "Full Organization Profile"}</span>
                <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ─── 10 Objectives Grid ─── */}
        <div ref={samitiGridRef}>
          <h4
            className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2"
            style={{
              opacity: samitiGridVisible ? 1 : 0,
              transform: samitiGridVisible ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.5s ease-out, transform 0.5s ease-out",
            }}
          >
            <span>❖</span>
            <span>{isHindi ? "समिति के 10 प्रमुख कार्य एवं संकल्प" : "10 Key Focus Areas & Commitments"}</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2.5">
            {samitiFocusAreas.map((area, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-amber-500/40 hover:bg-[var(--surface-hover)] hover:-translate-y-0.5 transition-all duration-200 cursor-default"
                style={{
                  opacity: samitiGridVisible ? 1 : 0,
                  transform: samitiGridVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `opacity 0.5s ease-out ${idx * 40}ms, transform 0.5s ease-out ${idx * 40}ms`,
                }}
              >
                <FiCheckCircle size={14} className="text-amber-500 shrink-0" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">
                  {isHindi ? area.hi : area.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeAboutSection;
