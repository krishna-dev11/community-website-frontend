import React, { useEffect } from "react";
import { FiSun, FiMapPin, FiCalendar, FiBookOpen, FiUser, FiCheckCircle, FiHeart } from "react-icons/fi";
import { balinathData } from "../data/bairwaData";
import { useLanguage } from "../i18n/LanguageContext";
import ModernFooter from "../Components/Core/Home/ModernFooter";

const BalinathPage = () => {
  const { t, isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-32 pb-14 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Life Journey & Intro */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-4">
              <FiSun size={13} className="animate-spin-slow" />
              <span>{isHindi ? "आध्यात्मिक मार्गदर्शक एवं समाज सुधारक" : "Spiritual Guide & Social Reformer"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {isHindi ? balinathData.titleHi : balinathData.titleEn}
            </h1>

            <p className="mt-2 text-sm sm:text-base font-bold text-[var(--accent-primary)]">
              {isHindi ? balinathData.subtitleHi : balinathData.subtitleEn}
            </p>

            <p className="mt-4 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
              {isHindi
                ? "महर्षि बालीनाथ जी महाराज बैरवा समाज के परम पूज्य संत एवं पथ-प्रदर्शक हैं। आपने समाज में शिक्षा का अलख जगाया, बाल विवाह व कुरीतियों का कड़ा विरोध किया और श्रम, कृषि व सदाचार के माध्यम से समाज को आत्मसम्मान और स्वावलंबन का मार्ग दिखाया।"
                : "Param Pujya Maharshi Balinath Ji Maharaj is the revered spiritual guide and social reformer of Bairwa Samaaj. He championed mass education, opposed child marriage and superstition, and guided the community toward dignity, hard work, and self-reliance."}
            </p>

            {/* Quick Biographical Facts Card */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  {isHindi ? "जन्म स्थान" : "Birthplace"}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] mt-1 flex items-center gap-1.5">
                  <FiMapPin size={12} className="text-emerald-400 shrink-0" />
                  <span>{isHindi ? balinathData.birthplaceHi : balinathData.birthplaceEn}</span>
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  {isHindi ? "जन्म तिथि / प्राकट्य" : "Birth Date"}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] mt-1 flex items-center gap-1.5">
                  <FiCalendar size={12} className="text-amber-400 shrink-0" />
                  <span>{isHindi ? balinathData.birthDateHi : balinathData.birthDateEn}</span>
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  {isHindi ? "बचपन का नाम" : "Childhood Name"}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] mt-1">
                  {isHindi ? balinathData.childhoodNameHi : balinathData.childhoodNameEn}
                </span>
              </div>

              <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  {isHindi ? "माता-पिता" : "Parents"}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] mt-1">
                  {isHindi ? balinathData.parentsHi : balinathData.parentsEn}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Portrait Area */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm aspect-[9/16] rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-black shadow-2xl group">
              <img
                src="/balinathjimaharaj.jpg"
                alt="महर्षि बालीनाथ जी महाराज"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent flex flex-col justify-end p-5 text-center">
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-widest mx-auto mb-2 border border-amber-500/30">
                  {isHindi ? "मण्डावरी धाम (दौसा)" : "Mandawari Dham (Dausa)"}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isHindi ? "परम पूज्य महर्षि बालीनाथ जी महाराज" : "Maharshi Balinath Ji Maharaj"}
                </h3>
                <p className="text-xs text-amber-200 mt-1 font-semibold">
                  {isHindi ? "पावन समाधि स्थल • वार्षिक जयंती: 31 दिसंबर" : "Sacred Samadhi • Annual Jayanti: 31 Dec"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachings & Social Philosophy */}
      <section className="py-14 sm:py-20 bg-[var(--surface-elevated)]/60 border-y border-[var(--border-subtle)] px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-3">
            <FiBookOpen size={13} />
            <span>{isHindi ? "अमृत उपदेश व दर्शन" : "Sacred Teachings & Vision"}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "महर्षि बालीनाथ जी के प्रमुख उपदेश" : "Key Teachings of Maharshi Balinath Ji"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "समाज सुधार, नैतिक आचरण एवं स्वावलंबन के चार प्रमुख आधार स्तम्भ"
              : "Four foundational pillars of social reform, moral conduct, and self-reliance"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {balinathData.teachings.map((tItem, idx) => (
            <div key={idx} className="ka-card p-5 rounded-2xl border border-[var(--border-subtle)] flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center font-black text-sm mb-3">
                  0{idx + 1}
                </div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  {isHindi ? tItem.titleHi : tItem.titleEn}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                  {isHindi ? tItem.descHi : tItem.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mandawari Dham Pilgrimage & Samadhi */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="ka-card p-6 sm:p-10 rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-raised)] via-[var(--surface)] to-[var(--surface-elevated)]">
          <div className="grid md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-8">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                {isHindi ? "पावन तीर्थ स्थल" : "Sacred Pilgrimage Site"}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1 mb-3">
                {isHindi ? "मण्डावरी धाम — बैरवा समाज की आस्था का केंद्र" : "Mandawari Dham — Center of Faith"}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                {isHindi
                  ? "मण्डावरी (तहसील लालसोट, जिला दौसा) में महर्षि बालीनाथ जी महाराज की पावन समाधि स्थित है, जहाँ प्रतिवर्ष लाखों श्रद्धालु दर्शनार्थ आते हैं। प्रतिवर्ष 31 दिसंबर एवं फाल्गुन शुक्ल सप्तमी को विशाल जयंती समारोह एवं मेले का आयोजन होता है।"
                  : "The holy Samadhi of Maharshi Balinath Ji Maharaj is situated at Mandawari (Tehsil Lalsot, District Dausa). Every year on 31st December and Phalguna Shukla Saptami, grand Jayanti celebrations and pilgrimage gatherings are held."}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-[var(--text-primary)]">
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <FiCheckCircle size={14} className="text-emerald-400" />
                  <span>{isHindi ? "वार्षिक बालीनाथ जयंती: 31 दिसंबर" : "Annual Jayanti: 31st December"}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold">
                  <FiCheckCircle size={14} className="text-emerald-400" />
                  <span>{isHindi ? "समाधि धाम: मण्डावरी (दौसा)" : "Samadhi Dham: Mandawari (Dausa)"}</span>
                </span>
              </div>
            </div>

            <div className="md:col-span-4 flex justify-center">
              <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-center w-full">
                <FiMapPin size={28} className="mx-auto text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-white mb-1">
                  {isHindi ? "मण्डावरी धाम दर्शन" : "Mandawari Dham Visit"}
                </h4>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isHindi ? "तहसील लालसोट, जिला दौसा (राजस्थान)" : "Tehsil Lalsot, Dist Dausa (Rajasthan)"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ModernFooter />
    </div>
  );
};

export default BalinathPage;
