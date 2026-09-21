import React from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeContributionCTA = () => {
  const { isHindi } = useLanguage();

  return (
    <section className="py-12 sm:py-16">
      <div className="relative p-8 sm:p-12 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-[#0c2e1f] via-[#092218] to-[#05140e] text-white shadow-2xl overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-4 py-1.5 text-xs font-bold text-emerald-300">
            <FiHeart size={14} className="text-rose-400" />
            <span>{isHindi ? "सामुदायिक सहयोग एवं विकास" : "Community Welfare & Support"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {isHindi ? "समाज के विकास में अपना योगदान दें" : "Contribute to Community Progress"}
          </h2>

          <p className="text-sm sm:text-base text-emerald-100/85 max-w-2xl mx-auto leading-relaxed font-normal">
            {isHindi
              ? "शिक्षा, स्वास्थ्य, सामाजिक सहयोग एवं सामुदायिक गतिविधियों के माध्यम से समाज की प्रगति में सहभागी बनें।"
              : "Become a partner in the holistic development of our community through educational assistance, healthcare support, and social welfare initiatives."}
          </p>

          <div className="pt-3 flex flex-wrap justify-center items-center gap-4">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-emerald-950/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <FiHeart size={16} className="text-white" />
              <span>{isHindi ? "योगदान करें" : "Contribute Now"}</span>
              <FiArrowRight size={16} />
            </Link>

            <Link
              to="/membership"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white text-xs sm:text-sm font-bold uppercase tracking-wider transition-all"
            >
              <span>{isHindi ? "सदस्यता नियम देखें" : "Samaj Membership"}</span>
            </Link>
          </div>

          <div className="pt-4 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs text-emerald-100/70">
            <span className="flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-400" size={14} />
              <span>{isHindi ? "पारदर्शी सामाजिक प्रबंधन" : "Transparent Community Trust"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <FiShield className="text-amber-400" size={14} />
              <span>{isHindi ? "सीधे छात्रवृत्ति एवं धर्मशाला हित में" : "Direct Student & Facility Welfare"}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeContributionCTA;
