import React from "react";
import { Link } from "react-router-dom";
import { FiBell, FiArrowRight, FiPhoneCall } from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeLiveTicker = () => {
  const { isHindi } = useLanguage();

  const updates = [
    { textHi: "आदिवासी हलबा/हलबी समाज कल्याण समिति, उज्जैन के आधिकारिक पोर्टल पर आपका स्वागत है।", textEn: "Welcome to the official community portal of Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain." },
    { textHi: "उज्जैन महाकाल दर्शन हेतु पधारने वाले समाज बंधुओं के लिए धर्मशाला व कमरा आरक्षण सुविधा उपलब्ध।", textEn: "Dharamshala room booking facility available for visiting pilgrims in Ujjain." },
    { textHi: "समिति सदस्यता एवं सदस्यता प्रमाण-पत्र हेतु ऑनलाइन पंजीकरण खुला है।", textEn: "Online registration open for Samaj Membership & Official Member Card." },
    { textHi: "सचिवालय हेल्पलाइन: +91 99260 18058 • सोमवार से रविवार प्रातः 8:00 से रात्रि 9:00 बजे तक।", textEn: "Secretariat Helpline: +91 99260 18058 • Mon-Sun 8:00 AM to 9:00 PM." },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-emerald-900 via-[#0a3522] to-amber-900/90 text-amber-100 py-2 px-3 sm:px-6 rounded-2xl border border-amber-500/30 shadow-md flex items-center gap-3 overflow-hidden text-xs">
      {/* Ticker Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500 text-emerald-950 font-black tracking-wider uppercase text-[10px] shrink-0 shadow-sm">
        <FiBell className="animate-bounce" size={12} />
        <span>{isHindi ? "ताज़ा सूचना" : "Live Notice"}</span>
      </div>

      {/* Marquee Content */}
      <div className="flex-1 overflow-hidden relative whitespace-nowrap">
        <div className="inline-flex items-center gap-8 animate-marquee">
          {updates.concat(updates).map((upd, i) => (
            <span key={i} className="inline-flex items-center gap-2 font-medium text-[11px] sm:text-xs">
              <span className="text-amber-400 font-bold">❖</span>
              <span>{isHindi ? upd.textHi : upd.textEn}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Quick Helpline CTA */}
      <a
        href="tel:+919926018058"
        className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold shrink-0 transition-colors"
      >
        <FiPhoneCall size={11} className="text-amber-300" />
        <span>9926018058</span>
      </a>
    </div>
  );
};

export default HomeLiveTicker;
