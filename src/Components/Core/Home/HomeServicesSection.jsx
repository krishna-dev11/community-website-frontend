import React from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiHeart,
  FiFileText,
  FiTrendingUp,
  FiShield,
  FiUsers,
  FiArrowRight,
} from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeServicesSection = () => {
  const { isHindi } = useLanguage();

  const services = [
    {
      icon: FiBookOpen,
      titleHi: "Education Support",
      subHi: "शिक्षा प्रोत्साहन व मार्गदर्शन",
      descHi: "मेधावी छात्र-छात्राओं का सम्मान, प्रतियोगी परीक्षा मार्गदर्शन एवं छात्रवृत्ति योजनाओं की जानकारी।",
      descEn: "Student mentoring, competitive examination guidance, and scholarship scheme facilitation.",
      image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=500&q=80",
    },
    {
      icon: FiHeart,
      titleHi: "Health Support",
      subHi: "स्वास्थ्य परामर्श व सहयोग",
      descHi: "आपातकालीन स्वास्थ्य परिस्थितियों में समाज बंधुओं को पारस्परिक सहयोग एवं स्वास्थ्य मार्गदर्शन।",
      descEn: "Emergency healthcare mutual assistance and community health guidance.",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80",
    },
    {
      icon: FiFileText,
      titleHi: "Government Assistance",
      subHi: "शासकीय योजना समन्वय",
      descHi: "जनजातीय कल्याणकारी योजनाओं, जाति प्रमाण-पत्र व शासकीय लाभों के प्रति प्रशासनिक समन्वय।",
      descEn: "Tribal welfare schemes, community certificates, and government program coordination.",
      image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=500&q=80",
    },
    {
      icon: FiTrendingUp,
      titleHi: "Economic Support",
      subHi: "आर्थिक स्वावलंबन सहयोग",
      descHi: "कौशल विकास, स्वरोजगार मार्गदर्शन एवं ज़रूरतमंद परिवारों को सामर्थ्यानुसार सामाजिक संबल।",
      descEn: "Skill development guidance, self-employment support, and aid for families.",
      image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=500&q=80",
    },
    {
      icon: FiShield,
      titleHi: "Rights Awareness",
      subHi: "संवैधानिक चेतना",
      descHi: "अनुसूचित जनजाति (ST) अधिकारों, संवैधानिक संरक्षण एवं सामाजिक समरसता के प्रति निरंतर चेतना।",
      descEn: "Scheduled Tribe (ST) rights awareness, constitutional protections, and dignity.",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=500&q=80",
    },
    {
      icon: FiUsers,
      titleHi: "Community Support",
      subHi: "पारस्परिक सामाजिक गोठ",
      descHi: "सामाजिक एकता, पारिवारिक मिलन समारोह, सामाजिक कुरीति निवारण एवं आपसी भाईचारे की सुदृढ़ता।",
      descEn: "Strengthening community brotherhood, mutual support, and cultural gatherings.",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=500&q=80",
    },
  ];

  return (
    <section className="py-10 sm:py-14">
      {/* Classic Section Heading with Ornamental Divider */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
          <FiUsers size={13} />
          <span>{isHindi ? "सामुदायिक सेवाएं" : "Community Services"}</span>
          <span>❖</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          {isHindi ? "समाज आपके साथ है" : "Samaj Is With You"}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-3 text-amber-500/60">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
          <span className="text-xs">♦ ❖ ♦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
          {isHindi
            ? "समिति द्वारा संचालित मुख्य सेवाएं एवं सहायता प्रणालियां"
            : "Core welfare and supportive initiatives organized by the Samiti"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {services.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group rounded-2xl overflow-hidden border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Visual Thumbnail */}
              <div className="relative aspect-[16/8] w-full overflow-hidden bg-black">
                <img
                  src={item.image}
                  alt={item.titleHi}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-75 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2.5 left-2.5 w-8 h-8 rounded-lg bg-black/70 backdrop-blur-md border border-amber-400/40 text-amber-400 flex items-center justify-center">
                  <Icon size={16} />
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[var(--text-primary)] mb-0.5">
                    {item.titleHi}
                  </h3>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mb-2">
                    {item.subHi}
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-normal">
                    {isHindi ? item.descHi : item.descEn}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/contact"
          className="btn-secondary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2"
        >
          <span>{isHindi ? "सचिवालय से सहायता हेतु संपर्क करें" : "Contact Secretariat for Assistance"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default HomeServicesSection;
