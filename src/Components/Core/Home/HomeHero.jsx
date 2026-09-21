import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiClock,
  FiMapPin,
  FiShield,
  FiAward,
  FiUsers,
  FiSun,
} from "react-icons/fi";
import { GiTempleDoor } from "react-icons/gi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeHero = () => {
  const { isHindi } = useLanguage();

  const heritageMilestones = [
    {
      year: "1979",
      titleHi: "समाज की प्रारंभिक यात्रा",
      titleEn: "Initial Journey",
      subHi: "14 मार्च 1979 प्रथम अनौपचारिक बैठक",
      subEn: "14 March 1979 First Meeting",
    },
    {
      year: "1980",
      titleHi: "इंदौर समिति से संबद्धता",
      titleEn: "Indore Affiliation",
      subHi: "25 वर्ष शाखा रूप में निरंतर समाज सेवा",
      subEn: "Active Service as Branch Unit",
    },
    {
      year: "2004",
      titleHi: "स्वतंत्र समिति",
      titleEn: "Independent Registration",
      subHi: "10 दिसंबर 2004 अधिकृत पंजीयन",
      subEn: "Registered on 10 Dec 2004",
    },
    {
      year: "2013",
      titleHi: "धर्मशाला एवं मंदिर प्राण-प्रतिष्ठा",
      titleEn: "Dharamshala & Mandir",
      subHi: "27 मई 2013 पावन लोकार्पण",
      subEn: "Consecrated on 27 May 2013",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-[#062417] via-[#041d13] to-[#02100a] text-white shadow-2xl">
      {/* Authentic Tribal Heritage Backdrop with Dark Classic Gradient */}
      <div className="absolute inset-0 opacity-15 mix-blend-luminosity pointer-events-none overflow-hidden">
        <img
          src="/images/tribal_heritage.jpg"
          alt="Tribal Community Art"
          className="w-full h-full object-cover scale-105 animate-pulse duration-10000"
        />
      </div>

      {/* Decorative Traditional Indian Border Motif at Top */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-500 shadow-sm" />

      {/* Ambient Spiritual Lighting */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 pb-10 sm:pb-12">
        {/* Top Auspicious Cultural Motto */}
        <div className="flex items-center justify-center sm:justify-start gap-2 mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/15 px-4 py-1.5 text-xs sm:text-sm font-bold tracking-wide text-amber-300 shadow-sm">
            <span className="text-amber-400">❖</span>
            <span>Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain</span>
            <span className="text-amber-400">❖</span>
          </div>
        </div>

        {/* Main Grid: Left Content, Right Visual Heritage Card */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          <div className="lg:col-span-7 space-y-5 text-center sm:text-left">
            {/* Tagline Heading */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl font-black tracking-tight leading-[1.25] text-white">
              “गर्व से कहो हम आदिवासी हैं,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300">
                भारत के मूल निवासी हैं”
              </span>
            </h1>

            {/* Supporting Description */}
            <p className="text-xs sm:text-sm md:text-base text-emerald-100/90 leading-relaxed font-normal max-w-2xl">
              {isHindi
                ? "सामाजिक उत्थान, शिक्षा, स्वास्थ्य, सांस्कृतिक संरक्षण और समाज में एकता एवं भाईचारे के लिए समर्पित।"
                : "Dedicated to social upliftment, education, healthcare, cultural preservation, and fostering unity and brotherhood within the community."}
            </p>

            {/* Classic Badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                <FiShield className="text-amber-400" size={13} />
                <span>संवैधानिक ST दर्जा</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                <FiClock className="text-amber-400" size={13} />
                <span>1979 से अनवरत सेवा</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                <GiTempleDoor className="text-amber-400" size={13} />
                <span>विट्ठल मंदिर व धर्मशाला धाम</span>
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3.5 pt-3">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/50 hover:scale-[1.02] active:scale-[0.98] transition-all border border-emerald-400/30"
              >
                <span>{isHindi ? "हमारे बारे में" : "About Us"}</span>
                <FiArrowRight size={16} />
              </Link>

              <Link
                to="/history"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-amber-400/40 hover:border-amber-300 bg-amber-500/10 hover:bg-amber-500/20 text-amber-200 text-xs sm:text-sm font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <FiClock size={15} className="text-amber-300" />
                <span>{isHindi ? "हमारा इतिहास" : "Our History"}</span>
              </Link>

              <Link
                to="/dharamshala"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-emerald-400/30 hover:border-emerald-400/50 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
              >
                <FiMapPin size={15} className="text-emerald-400" />
                <span>{isHindi ? "धर्मशाला" : "Dharamshala"}</span>
              </Link>
            </div>
          </div>

          {/* Right Visual Heritage Card with Vitthal Mandir Image & Emblem */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="group relative w-full max-w-sm rounded-3xl border-2 border-amber-500/30 bg-gradient-to-b from-[#0e3524] to-[#082015] p-5 shadow-2xl overflow-hidden hover:border-amber-400/50 transition-all duration-500">
              {/* Image Preview with Classic Ornate Frame */}
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden border border-amber-500/20 bg-black shadow-inner">
                <img
                  src="/images/vitthal_mandir.jpg"
                  alt="Shri Vitthal Rukmani Mandir Ujjain"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 text-[10px] font-bold text-amber-300 flex items-center gap-1.5">
                  <GiTempleDoor size={12} />
                  <span>श्री विट्ठल-रुक्मिणी मंदिर, उज्जैन</span>
                </div>
                <div className="absolute bottom-2 inset-x-3 text-left">
                  <span className="text-[10px] text-amber-200/90 font-medium">
                    धर्मशाला परिसर • नरसिंह घाट रोड, उज्जैन
                  </span>
                </div>
              </div>

              {/* Emblem & Registered Credentials */}
              <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center p-2 shrink-0">
                  <img
                    src="/logo.png"
                    alt="Samiti Logo"
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                    {isHindi ? "पंजीकृत सामाजिक संस्था" : "Registered Socio-Cultural Body"}
                  </span>
                  <h4 className="text-sm font-black text-white truncate">
                    {isHindi ? "उज्जैन केंद्रीय मुख्यालय" : "Central Headquarters, Ujjain"}
                  </h4>
                  <p className="text-[11px] text-emerald-200/75 mt-0.5">
                    {isHindi
                      ? "पंजीयन: 10.12.2004 • स्थापना: 1979"
                      : "Reg: 10.12.2004 • Estd. 1979"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heritage Trust / Legacy Stats Row (4 Milestones) with Classic Styling */}
        <div className="mt-8 sm:mt-10 pt-6 border-t border-amber-500/20 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {heritageMilestones.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl border border-amber-500/20 bg-black/30 backdrop-blur-md hover:bg-black/40 hover:border-amber-400/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 group-hover:scale-105 transition-transform">
                  {item.year}
                </span>
                <span className="text-amber-400/50 text-xs">❖</span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                {isHindi ? item.titleHi : item.titleEn}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-emerald-100/75 mt-0.5 leading-tight font-normal">
                {isHindi ? item.subHi : item.subEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
