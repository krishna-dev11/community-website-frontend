import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiSun,
  FiMapPin,
  FiCalendar,
  FiShield,
  FiHeart,
  FiCheckCircle,
  FiArrowRight,
  FiInfo,
  FiStar,
} from "react-icons/fi";
import { GiTempleDoor } from "react-icons/gi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";
import { useScrollReveal } from "../Utilities/useScrollReveal";

const ReligionFaithPage = () => {
  const { isHindi } = useLanguage();
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const ujjainHeritage = organizationInfo.ujjainSamitiHeritage;
  const regionalInfo = organizationInfo.regionalDeitiesInfo;

  const deityAccents = [
    { border: "border-amber-500/40", bg: "from-amber-500/10 via-amber-500/5 to-transparent", image: "/images/GramDevDulhaDev.png", accent: "text-amber-500" },
    { border: "border-orange-500/40", bg: "from-orange-500/10 via-orange-500/5 to-transparent", image: "/images/MothoBadaDev.png", accent: "text-orange-500" },
    { border: "border-rose-500/40", bg: "from-rose-500/10 via-rose-500/5 to-transparent", image: "/images/karuboa.jpg", accent: "text-rose-500" },
    { border: "border-emerald-500/40", bg: "from-emerald-500/10 via-emerald-500/5 to-transparent", image: "/images/vitthal_mandir.jpg", accent: "text-emerald-500" },
  ];

  const delayClasses = ["reveal-delay-1","reveal-delay-2","reveal-delay-3","reveal-delay-4"];

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300"
    >
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(252,211,77,0.2),transparent_30%),linear-gradient(to_bottom,_rgba(15,23,42,0.06),transparent_60%)]" />
        <div className="absolute inset-x-0 top-0 h-80 bg-[url('/images/tribal_heritage.jpg')] bg-cover bg-center opacity-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full bg-amber-500/8 blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto">
          <div className="reveal mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-white/80 shadow-sm px-4 py-1.5 text-xs font-bold text-amber-700 backdrop-blur-sm">
            <FiSun size={13} />
            <span>{isHindi ? "आस्था, आराध्य देव एवं पावन धरोहर" : "Faith, Revered Deities & Sacred Heritage"}</span>
          </div>

          <div className="reveal rounded-[32px] border border-[var(--border-subtle)] bg-white/80 shadow-[0_30px_80px_-30px_rgba(12,26,16,0.35)] backdrop-blur-sm p-6 sm:p-8 lg:p-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight mb-4">
                {isHindi
                  ? <>आदिवासी हल्बा/हल्बी समाज के <span className="gradient-text-brand">आराध्य देव</span></>
                  : <>Revered Deities of <span className="gradient-text-brand">Halba/Halbi</span> Community</>}
              </h1>

              <p className="text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
                {isHindi
                  ? "“गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं” — उज्जैन समिति के अधिकृत आराध्य देव: ग्राम देव (दूल्हा देव), मोथो (बड़ा देव), कारू बोआ एवं श्री विट्ठल-रुक्मिणी मंदिर।"
                  : "The sacred ancestral spiritual traditions: Gram Dev (Dulha Dev), Motho (Bada Dev), Karu Boa, and Shri Vitthal-Rukmani Mandir in Ujjain."}
              </p>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs">
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 font-semibold text-emerald-700">
                  <FiMapPin size={12} className="text-emerald-600" />
                  {isHindi ? organizationInfo.headOffice.addressHi : organizationInfo.headOffice.addressEn}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 font-semibold text-amber-700">
                  <FiCalendar size={12} className="text-amber-600" />
                  {isHindi ? "प्राण-प्रतिष्ठा: 27 मई 2013" : "Pran-Pratishtha: 27 May 2013"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-glow-divider reveal" />

      {/* ───────────────── CONFIRMED DEITIES ───────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-400 mb-3">
            <GiTempleDoor size={14} />
            <span>{isHindi ? "अधिकृत आस्था एवं परंपरा" : "Confirmed Samaj Heritage"}</span>
          </div>
          <h2 className="reveal reveal-delay-1 text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? ujjainHeritage.titleHi : ujjainHeritage.titleEn}
          </h2>
          <p className="reveal reveal-delay-2 text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन के अभिलेखों के अनुसार अधिकृत देव एवं मंदिर प्रतिष्ठा:"
              : "According to official records of Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain:"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
          {ujjainHeritage.deities.map((deity, idx) => {
            const a = deityAccents[idx] || deityAccents[0];
            return (
              <div
                key={idx}
                className={`reveal ${delayClasses[idx]} group overflow-hidden rounded-[28px] border border-[var(--border-subtle)] bg-white/80 shadow-[0_25px_60px_-32px_rgba(15,23,42,0.5)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-30px_rgba(15,23,42,0.65)] ${a.border}`}
              >
                <div className={`relative bg-gradient-to-br ${a.bg}`}>
                  <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/40 to-transparent" />
                  <img
                    src={a.image}
                    alt={isHindi ? deity.nameHi : deity.nameEn}
                    className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                    <span className={`text-sm ${a.accent}`}>✦</span>
                    {isHindi ? "आस्था" : "Faith"}
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">
                    {isHindi ? deity.nameHi : deity.nameEn}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {isHindi ? deity.descHi : deity.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div className="section-glow-divider reveal" />

      {/* ───────────────── VITTHAL MANDIR FEATURE ───────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="reveal hover-lift ka-card p-6 sm:p-10 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-[var(--surface-elevated)]">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left content */}
            <div className="lg:col-span-8 space-y-4">
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10">
                <FiStar size={11} />
                {isHindi ? "धर्मशाला परिसर स्थित पावन धाम" : "Sacred Shrine on Premises"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-snug">
                {isHindi
                  ? "श्री विट्ठल-रुक्मिणी मंदिर, नरसिंह घाट रोड, उज्जैन"
                  : "Shri Vitthal–Rukmani Mandir, Ujjain"}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                {isHindi
                  ? "27 मई 2013 को हल्बा समाज धर्मशाला के लोकार्पण के साथ ही श्री विट्ठल-रुक्मिणी मंदिर की वैदिक विधि-विधान से पावन प्राण-प्रतिष्ठा संपन्न हुई। यह मंदिर उज्जैन महाकाल व क्षिप्रा तीर्थ यात्रा पर आने वाले समाज बंधुओं व श्रद्धालुओं के लिए भक्ति, शांति एवं सत्संग का परम पावन केंद्र है।"
                  : "On 27 May 2013, alongside the grand inauguration of Halba Samaj Dharamshala, the Pran-Pratishtha of Shri Vitthal-Rukmani Mandir was consecrated with Vedic rituals. It serves as a spiritual sanctuary for pilgrims visiting holy Ujjain and the Shipra Ghats."}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
                <Link to="/dharamshala" className="btn-primary text-xs">
                  <span>{isHindi ? "धर्मशाला एवं कमरों का विवरण" : "Dharamshala & Rooms"}</span>
                  <FiArrowRight size={14} />
                </Link>
                <Link to="/contact" className="btn-secondary text-xs">
                  <span>{isHindi ? "स्थान निर्देश" : "Temple Route & Location"}</span>
                </Link>
              </div>
            </div>

            {/* Right facts */}
            <div className="lg:col-span-4">
              <div className="p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs space-y-3">
                <span className="font-bold text-[var(--text-primary)] block border-b border-[var(--border-subtle)] pb-2">
                  {isHindi ? "मंदिर एवं धर्मशाला तथ्य" : "Key Facts"}
                </span>
                {[
                  { label: isHindi ? "भूमि अनुबंध:" : "Land Agreement:", val: "18.06.2005", color: "" },
                  { label: isHindi ? "भूमि पूजन:" : "Bhumi Pujan:", val: "04.03.2012", color: "" },
                  { label: isHindi ? "प्राण-प्रतिष्ठा:" : "Inauguration:", val: "27.05.2013", color: "text-emerald-400" },
                  { label: isHindi ? "निकटतम तीर्थ:" : "Nearby:", val: "नरसिंह घाट, कालिका मंदिर", color: "" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="text-[var(--text-secondary)]">{row.label}</span>
                    <span className={`font-bold text-right ${row.color || "text-[var(--text-primary)]"}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-glow-divider reveal" />

      {/* ───────────────── REGIONAL TRADITIONS ───────────────── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="reveal hover-lift ka-card p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)]">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase mb-4">
            <FiInfo size={14} />
            <span>{isHindi ? "क्षेत्रीय नृवंशवैज्ञानिक अध्ययन" : "Regional Ethnographic Context"}</span>
          </div>

          <h3 className="reveal reveal-delay-1 text-lg sm:text-2xl font-black text-[var(--text-primary)] mb-3">
            {isHindi ? regionalInfo.titleHi : regionalInfo.titleEn}
          </h3>

          <p className="reveal reveal-delay-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            {isHindi ? regionalInfo.descHi : regionalInfo.descEn}
          </p>

          <div className="reveal reveal-delay-3 p-4 rounded-2xl border border-sky-500/20 bg-sky-500/5 text-xs text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">
              {isHindi ? "महत्वपूर्ण स्पष्टता: " : "Important Note: "}
            </strong>
            {isHindi
              ? "बस्तर एवं अन्य मध्य भारतीय अंचलों के क्षेत्रीय देवों (जैसे माँ दंतेश्वरी) का उल्लेख व्यापक समाज इतिहास के संदर्भ में है। उज्जैन समिति की पुष्टीकृत परंपराएं ऊपर पृथक रूप से स्पष्ट की गई हैं।"
              : "Regional deities such as Maa Danteshwari reflect broader Central Indian tribal history and are presented separately from Ujjain Samiti's confirmed heritage above."}
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default ReligionFaithPage;
