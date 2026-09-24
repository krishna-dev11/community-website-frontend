import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiClock, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeHero = () => {
  const { isHindi } = useLanguage();

  return (
    <section className="relative w-full rounded-2xl sm:rounded-3xl border border-stone-200/80 dark:border-stone-800 bg-[#FCFBF7] dark:bg-[#0c1611] text-stone-900 dark:text-stone-100 shadow-sm overflow-hidden border-t-4 border-t-[#14532d] dark:border-t-emerald-600">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-14">
        {/* Main Grid: Left Content, Right Authentic Image Card */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE — MAIN CONTENT */}
          <div className="lg:col-span-7 space-y-5 text-left">
            {/* Community Identification Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#14532d]/10 dark:bg-emerald-950/60 border border-[#14532d]/20 dark:border-emerald-800/40 text-[#14532d] dark:text-emerald-300 text-xs sm:text-sm font-semibold">
              <span className="text-amber-600 dark:text-amber-400">❖</span>
              <span>Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain</span>
            </div>

            {/* Main Tagline */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] font-extrabold tracking-tight text-[#0f2e1e] dark:text-stone-50 leading-[1.3] sm:leading-[1.32]">
              “गर्व से कहो हम आदिवासी हैं,
              <br />
              <span className="text-[#14532d] dark:text-emerald-400">
                भारत के मूल निवासी हैं”
              </span>
            </h1>

            {/* Short Supporting Description */}
            <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-normal max-w-xl">
              {isHindi
                ? "समाजिक उत्थान, शिक्षा, स्वास्थ्य, सांस्कृतिक संरक्षण और समाज में एकता एवं भाईचारे के लिए समर्पित।"
                : "Dedicated to social upliftment, education, healthcare, cultural preservation, and fostering unity and brotherhood within the community."}
            </p>

            {/* Simple Trust Points */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-stone-600 dark:text-stone-400">
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle className="text-[#14532d] dark:text-emerald-400 shrink-0" size={14} />
                <span>{isHindi ? "संवैधानिक ST दर्जा" : "Constitutional ST Status"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle className="text-[#14532d] dark:text-emerald-400 shrink-0" size={14} />
                <span>{isHindi ? "1979 से निरंतर सेवारत" : "Serving Continuously Since 1979"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle className="text-[#14532d] dark:text-emerald-400 shrink-0" size={14} />
                <span>{isHindi ? "उज्जैन केंद्रीय मुख्यालय" : "Central HQ, Ujjain"}</span>
              </span>
            </div>

            {/* Primary Actions: 3 Simple Rounded Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-lg bg-[#14532d] hover:bg-[#0f3f22] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <span>{isHindi ? "हमारे बारे में" : "About Us"}</span>
                <FiArrowRight size={15} />
              </Link>

              <Link
                to="/history"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900/60 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <FiClock size={14} className="text-stone-500 dark:text-stone-400" />
                <span>{isHindi ? "हमारा इतिहास" : "Our History"}</span>
              </Link>

              <Link
                to="/dharamshala"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg border border-amber-600/30 dark:border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-semibold shadow-xs transition-colors"
              >
                <FiMapPin size={14} className="text-amber-700 dark:text-amber-400" />
                <span>{isHindi ? "धर्मशाला" : "Dharamshala"}</span>
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE — IMAGE & CREDENTIALS */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#111e17] p-3 sm:p-4 shadow-sm">
              {/* Photo Card */}
              <div className="relative aspect-[16/11] rounded-lg sm:rounded-xl overflow-hidden border border-stone-100 dark:border-stone-800 bg-stone-100 dark:bg-stone-900">
                <img
                  src="/images/vitthal_mandir.jpg"
                  alt="श्री विट्ठल-रुक्मिणी मंदिर, उज्जैन"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3.5 py-2.5 text-white">
                  <p className="text-xs sm:text-sm font-bold">श्री विट्ठल-रुक्मिणी मंदिर एवं धर्मशाला धाम</p>
                  <p className="text-[11px] text-stone-200/90 font-medium">नरसिंह घाट रोड, उज्जैन (म.प्र.)</p>
                </div>
              </div>

              {/* Organization Details */}
              <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-[#14532d] dark:text-emerald-400">
                    {isHindi ? "पंजीकृत सामाजिक संस्था" : "Registered Community Trust"}
                  </p>
                  <p className="text-[11px] text-stone-600 dark:text-stone-400">
                    {isHindi ? "उज्जैन, मध्यप्रदेश" : "Ujjain, Madhya Pradesh"}
                  </p>
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wide">
                    {isHindi ? "पंजीकरण एवं स्थापना" : "Reg & Estd."}
                  </p>
                  <p className="text-[11px] font-semibold text-stone-800 dark:text-stone-200">
                    10.12.2004 • Estd. 1979
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeHero;
