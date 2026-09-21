import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiAward,
  FiUsers,
  FiHeart,
  FiBookOpen,
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiClock,
  FiActivity,
  FiStar,
  FiZap,
} from "react-icons/fi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo, ujjainSamitiTimeline } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";
import { useScrollReveal } from "../Utilities/useScrollReveal";

/* ── Stat item used in the hero stats bar ── */
function StatItem({ value, labelHi, labelEn, isHindi, color = "text-[var(--accent-primary)]", delay = "" }) {
  return (
    <div className={`flex flex-col items-center gap-0.5 reveal reveal-scale ${delay}`}>
      <span className={`text-2xl sm:text-3xl font-black font-mono ${color}`}>{value}</span>
      <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] text-center leading-tight">
        {isHindi ? labelHi : labelEn}
      </span>
    </div>
  );
}

const AboutPage = () => {
  const { isHindi } = useLanguage();
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const clientObjectives = [
    { titleHi: "शिक्षा (Education)", descHi: "शैक्षणिक सहायता, छात्रवृत्ति मार्गदर्शन व प्रतिभा सम्मान।", titleEn: "Education", descEn: "Academic support, scholarship guidance & talent recognition.", icon: <FiBookOpen size={16} /> },
    { titleHi: "स्वास्थ्य (Healthcare)", descHi: "स्वास्थ्य संबंधित सहायता एवं चिकित्सा परामर्श।", titleEn: "Healthcare", descEn: "Health support and medical consultation.", icon: <FiHeart size={16} /> },
    { titleHi: "शासकीय सहायता", descHi: "शासकीय सहायता एवं योजनाओं से समन्वय।", titleEn: "Govt. Support", descEn: "Coordination with government schemes.", icon: <FiShield size={16} /> },
    { titleHi: "आर्थिक सहयोग", descHi: "ज़रूरतमंद परिवारों हेतु आर्थिक सहायता।", titleEn: "Economic Aid", descEn: "Financial assistance for needy families.", icon: <FiZap size={16} /> },
    { titleHi: "सामाजिक सहयोग", descHi: "सामाजिक स्तर पर परस्पर सहयोग व संबल।", titleEn: "Social Support", descEn: "Mutual cooperation and community bonding.", icon: <FiUsers size={16} /> },
    { titleHi: "सामाजिक सुधार", descHi: "समाज में फैली कुरीतियों को समाप्त करना।", titleEn: "Social Reform", descEn: "Eliminating social evils.", icon: <FiActivity size={16} /> },
    { titleHi: "संस्कृति", descHi: "सामाजिक परंपरा एवं सांस्कृतिक विरासत को जीवित रखना।", titleEn: "Culture", descEn: "Preserving traditions & cultural heritage.", icon: <FiStar size={16} /> },
    { titleHi: "सामुदायिक एकता", descHi: "समाज के लोगों में आपसी भाईचारा बढ़ाना।", titleEn: "Community Unity", descEn: "Strengthening brotherhood.", icon: <FiUsers size={16} /> },
    { titleHi: "सामाजिक कार्यक्रम", descHi: "मेल-मिलाप व भाईचारे हेतु कार्यक्रमों का आयोजन।", titleEn: "Social Programs", descEn: "Organizing community events.", icon: <FiAward size={16} /> },
    { titleHi: "अधिकार चेतना", descHi: "समाज के लोगों को अपने अधिकारों के प्रति जागरूक करना।", titleEn: "Rights Awareness", descEn: "Educating members about their rights.", icon: <FiCheckCircle size={16} /> },
    { titleHi: "प्रशासनिक समन्वय", descHi: "सामाजिक समानता हेतु प्रशासन के साथ निरंतर समन्वय।", titleEn: "Admin Coordination", descEn: "Continuous coordination with administration.", icon: <FiShield size={16} /> },
  ];

  const delayClasses = [
    "reveal-delay-1","reveal-delay-2","reveal-delay-3","reveal-delay-4",
    "reveal-delay-5","reveal-delay-6","reveal-delay-7","reveal-delay-8",
    "reveal-delay-9","reveal-delay-10","reveal-delay-11","reveal-delay-12",
  ];

  return (
    <div
      ref={pageRef}
      className="relative w-full min-h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-x-hidden font-sans transition-colors duration-300"
    >
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative pt-28 sm:pt-36 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[var(--accent-primary)]/5 blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 mb-6 shadow-sm">
            <FiShield size={13} />
            <span>{isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}</span>
          </div>

          {/* Main heading */}
          <h1 className="reveal heading-hero text-[var(--text-primary)] mb-5 leading-[1.12]">
            {isHindi
              ? <>"गर्व से कहो हम <span className="gradient-text-brand">आदिवासी</span> हैं"</>
              : <>"GARV SE KAHO HUM <span className="gradient-text-brand">ADIVASI</span> HAI"</>
            }
          </h1>

          <p className="reveal reveal-delay-1 text-sm sm:text-lg font-semibold text-[var(--accent-primary)] max-w-3xl mx-auto mb-3">
            {isHindi ? organizationInfo.purposeHi : organizationInfo.purposeEn}
          </p>

          <p className="reveal reveal-delay-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto">
            {isHindi
              ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन (प्रथम बैठक 14 मार्च 1979 | स्वतंत्र पंजीयन 10 दिसंबर 2004) समाज के सर्वांगीण उत्थान हेतु समर्पित है।"
              : "A registered tribal welfare organization (First meeting 14 March 1979 | Independent registration 10 December 2004) dedicated to education, health, economic aid, and community unity."}
          </p>

          {/* Address pill */}
          <div className="reveal reveal-delay-3 mt-7 inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] px-5 py-2.5 text-xs text-[var(--text-secondary)] shadow-sm">
            <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
              <FiMapPin size={13} className="text-emerald-400" />
              {isHindi ? organizationInfo.headOffice.addressHi : organizationInfo.headOffice.addressEn}
            </span>
            <span className="opacity-40">•</span>
            <a href="tel:+919926018058" className="font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1">
              <FiPhone size={11} />
              {organizationInfo.headOffice.phoneDisplay}
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative max-w-3xl mx-auto mt-12">
          <div className="reveal reveal-delay-4 grid grid-cols-3 sm:grid-cols-3 gap-4 sm:gap-8 p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] shadow-md text-center">
            <StatItem value="1979" labelHi="प्रथम बैठक" labelEn="First Meeting" isHindi={isHindi} delay="reveal-delay-5" />
            <StatItem value="2004" labelHi="स्वतंत्र पंजीयन" labelEn="Registration" isHindi={isHindi} color="text-sky-400" delay="reveal-delay-6" />
            <StatItem value="45+" labelHi="वर्षों की सेवा" labelEn="Years of Service" isHindi={isHindi} color="text-purple-400" delay="reveal-delay-7" />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-glow-divider reveal" />

      {/* ───────────────── SIX PILLARS ───────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-4 py-1.5 text-xs font-bold text-[var(--accent-primary)] mb-3">
            <FiAward size={13} />
            <span>{isHindi ? "समिति के 6 मुख्य स्तंभ" : "The Six Core Pillars"}</span>
          </div>
          <h2 className="reveal reveal-delay-1 text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "समाज उत्थान के छह आधार स्तंभ" : "Six Pillars of Community Upliftment"}
          </h2>
          <p className="reveal reveal-delay-2 text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "क्लाइंट द्वारा प्रेषित मुख्य ध्येय के अनुरूप समिति के कार्यक्षेत्र:"
              : "Framed directly from the official mission goals of the Samiti:"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizationInfo.sixPillars.map((pillar, i) => (
            <div
              key={pillar.id}
              className={`reveal ${delayClasses[i] || ""} hover-lift ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-4 group`}
            >
              <div className="h-11 w-11 rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/25 flex items-center justify-center text-[var(--accent-primary)] font-black text-sm group-hover:bg-[var(--accent-primary)]/20 transition-colors">
                0{pillar.id}
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--text-primary)] mb-1.5">
                  {isHindi ? pillar.nameHi : pillar.nameEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {isHindi ? pillar.descHi : pillar.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="section-glow-divider reveal" />

      {/* ───────────────── 11 OBJECTIVES ───────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="reveal ka-card p-6 sm:p-10 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-6 border-b border-[var(--border-subtle)]">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                {isHindi ? "समिति के 11 मुख्य उद्देश्य" : "11 Key Objectives of the Samiti"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                {isHindi ? "अधिकृत दस्तावेज़ों से संकलित उद्देश्य" : "Compiled from official Samiti records"}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold">
              <FiCheckCircle size={12} />
              {isHindi ? "11 उद्देश्य" : "11 Objectives"}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientObjectives.map((obj, idx) => (
              <div
                key={idx}
                className={`reveal ${delayClasses[idx] || ""} hover-lift p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] space-y-2 group`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/20 transition-colors flex-shrink-0">
                    {obj.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-[var(--accent-primary)]">
                    उद्देश्य {String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                  {isHindi ? obj.titleHi : obj.titleEn}
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  {isHindi ? obj.descHi : obj.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-glow-divider reveal" />

      {/* ───────────────── TIMELINE ───────────────── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-400 mb-3">
            <FiClock size={13} />
            <span>{isHindi ? "संस्था का इतिहास एवं कालक्रम" : "Institutional Journey (1979 – Present)"}</span>
          </div>
          <h2 className="reveal reveal-delay-1 text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "उज्जैन समिति की ऐतिहासिक उपलब्धियां" : "Milestones of Ujjain Samiti"}
          </h2>
          <p className="reveal reveal-delay-2 text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "14 मार्च 1979 की प्रथम बैठक से लेकर धर्मशाला निर्माण (2013) तक:"
              : "From the first meeting in 1979 to Dharamshala inauguration in 2013:"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ujjainSamitiTimeline.map((item, idx) => (
            <div
              key={idx}
              className={`reveal ${delayClasses[idx % 12] || ""} hover-lift ka-card p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] flex flex-col gap-3 group`}
            >
              <span className="inline-block px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-black text-xs self-start">
                {item.date}
              </span>
              <h4 className="font-bold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                {isHindi ? item.titleHi : item.titleEn}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isHindi ? item.descHi : item.descEn}
              </p>
            </div>
          ))}
        </div>

        <div className="reveal reveal-delay-3 mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/management-committee" className="btn-primary text-xs">
            <span>{isHindi ? "वर्तमान कार्यकारिणी देखें" : "View Leadership Committees"}</span>
            <FiArrowRight size={14} />
          </Link>
          <Link to="/dharamshala" className="btn-secondary text-xs">
            <span>{isHindi ? "हल्बा समाज धर्मशाला उज्जैन" : "Halba Samaj Dharamshala"}</span>
          </Link>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default AboutPage;
