import React from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiHome,
  FiImage,
  FiAward,
  FiCalendar,
  FiPhoneCall,
  FiArrowUpRight,
} from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeQuickActions = () => {
  const { isHindi } = useLanguage();

  const actions = [
    {
      to: "/membership",
      icon: FiUsers,
      titleHi: "सदस्यता",
      titleEn: "Membership",
      descHi: "समाज सदस्यता व प्रमाण-पत्र",
      descEn: "Samaj Card & Registry",
      accent: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-500/25 hover:border-emerald-500/50",
      tag: "पंजीकरण",
    },
    {
      to: "/dharamshala",
      icon: FiHome,
      titleHi: "धर्मशाला",
      titleEn: "Dharamshala",
      descHi: "कक्ष आरक्षण व रियायती दरें",
      descEn: "Room Booking & Facilities",
      accent: "text-amber-600 dark:text-amber-400",
      border: "border-amber-500/25 hover:border-amber-500/50",
      tag: "उज्जैन धाम",
    },
    {
      to: "/gallery",
      icon: FiImage,
      titleHi: "गैलरी",
      titleEn: "Gallery",
      descHi: "कार्यक्रम छायाचित्र संग्रह",
      descEn: "Photo & Event Albums",
      accent: "text-cyan-600 dark:text-cyan-400",
      border: "border-cyan-500/25 hover:border-cyan-500/50",
      tag: "यादें",
    },
    {
      to: "/achievements",
      icon: FiAward,
      titleHi: "समाज गौरव",
      titleEn: "Samaj Pride",
      descHi: "प्रतिभा सम्मान व उपलब्धियां",
      descEn: "Community Talents & Honors",
      accent: "text-purple-600 dark:text-purple-400",
      border: "border-purple-500/25 hover:border-purple-500/50",
      tag: "प्रतिभा",
    },
    {
      to: "/notices",
      icon: FiCalendar,
      titleHi: "कार्यक्रम व सूचना",
      titleEn: "Events & Notices",
      descHi: "नवीनतम परिपत्र एवं घोषणाएं",
      descEn: "Circulars & Announcements",
      accent: "text-rose-600 dark:text-rose-400",
      border: "border-rose-500/25 hover:border-rose-500/50",
      tag: "परिपत्र",
    },
    {
      to: "/contact",
      icon: FiPhoneCall,
      titleHi: "संपर्क",
      titleEn: "Contact",
      descHi: "कार्यालय व हेल्पलाइन",
      descEn: "Central Office & Helpline",
      accent: "text-teal-600 dark:text-teal-400",
      border: "border-teal-500/25 hover:border-teal-500/50",
      tag: "सचिवालय",
    },
  ];

  return (
    <section className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;
          return (
            <Link
              key={idx}
              to={act.to}
              className={`group relative p-3.5 sm:p-4 rounded-2xl border-2 ${act.border} bg-[var(--surface-elevated)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden`}
            >
              {/* Top Tag & Icon */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--surface)] border border-[var(--border-subtle)] ${act.accent} group-hover:scale-110 transition-transform shadow-inner`}
                >
                  <Icon size={18} />
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-md bg-[var(--surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider border border-[var(--border-subtle)]">
                  {act.tag}
                </span>
              </div>

              {/* Text Info */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-[var(--text-primary)] leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {isHindi ? act.titleHi : act.titleEn}
                  </h3>
                  <FiArrowUpRight
                    size={14}
                    className="text-[var(--text-muted)] group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  />
                </div>
                <p className="text-[10px] sm:text-[11px] text-[var(--text-secondary)] mt-1 leading-snug line-clamp-1">
                  {isHindi ? act.descHi : act.descEn}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default HomeQuickActions;
