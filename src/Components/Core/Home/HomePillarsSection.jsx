import React from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiHeart,
  FiUsers,
  FiFileText,
  FiSun,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomePillarsSection = () => {
  const { isHindi } = useLanguage();

  const pillars = [
    {
      id: "01",
      icon: FiBookOpen,
      titleHi: "शिक्षा",
      titleEn: "Education",
      descHi: "छात्रों एवं परिवारों के लिए शैक्षणिक सहायता, छात्रवृत्ति मार्गदर्शन व प्रतिभा प्रोत्साहन।",
      descEn: "Educational guidance, scholarship facilitation, and merit recognition for students.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqSTz9sUjdsbRYPLUIJ7CPLZvKcUomqgoBTEUlbHSgMQ&s=10",
    },
    {
      id: "02",
      icon: FiHeart,
      titleHi: "स्वास्थ्य",
      titleEn: "Healthcare",
      descHi: "स्वास्थ्य संबंधी मार्गदर्शन, आपातकालीन सहायता एवं सामुदायिक स्वास्थ्य चेतना।",
      descEn: "Healthcare assistance, emergency medical support, and health awareness.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfFqwXgiAbnTUCYBGq7hCWgU8g_ff5v1BDeyuQQfVIOA&s=10",
    },
    {
      id: "03",
      icon: FiUsers,
      titleHi: "सामाजिक सहयोग",
      titleEn: "Social Assistance",
      descHi: "ज़रूरतमंद समाज बंधुओं एवं परिवारों को आवश्यकतानुसार सामाजिक व आर्थिक संबल।",
      descEn: "Need-based community support and assistance for underprivileged families.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQNbOBxwzuVdILmdHEIJ_9sugQm14GwpUJVjK652chVLQ&s=10",
    },
    {
      id: "04",
      icon: FiFileText,
      titleHi: "शासकीय सहायता",
      titleEn: "Government Support",
      descHi: "जनजातीय कल्याण योजनाओं, प्रमाण-पत्रों व अधिकारों के प्रति प्रशासनिक समन्वय।",
      descEn: "Awareness of government tribal welfare schemes, certificates, and coordination.",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTx6EpbViINNldVndDw5Z1vwtCh88Z1EXygYIlcO1GyRA&s=10",
    },
    {
      id: "05",
      icon: FiSun,
      titleHi: "संस्कृति एवं परंपरा",
      titleEn: "Culture & Tradition",
      descHi: "सामाजिक परंपराओं, लोक संस्कृति, नवाखानी, आमा तेवर व जनजातीय गौरव का संरक्षण।",
      descEn: "Preservation of tribal customs, folk traditions, festivals, and heritage.",
      image: "/images/tribal_heritage.jpg",
    },
    {
      id: "06",
      icon: FiShield,
      titleHi: "सामाजिक एकता",
      titleEn: "Community Unity",
      descHi: "आपसी भाईचारा संवर्धन, सामाजिक मेल-मिलाप के कार्यक्रमों का आयोजन व कुरीति निवारण।",
      descEn: "Fostering fraternity, community gatherings, youth engagement, and social harmony.",
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section className="py-10 sm:py-14">
      {/* Classic Section Heading with Ornamental Divider */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
          <span>❖</span>
          <span>{isHindi ? "समिति के 6 मुख्य संकल्प" : "Six Community Pillars"}</span>
          <span>❖</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          {isHindi ? "समाज सेवा व उत्थान के 6 आधार स्तंभ" : "Foundational Pillars of Community Progress"}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-3 text-amber-500/60">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
          <span className="text-xs">♦ ❖ ♦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="group relative rounded-2xl overflow-hidden border-2 border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-amber-500/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image Header with Dark Gradient Overlay */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                <img
                  src={pillar.image}
                  alt={pillar.titleHi}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Floating Number Badge & Icon */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-amber-400/40 flex items-center gap-2 text-white">
                  <Icon size={14} className="text-amber-400" />
                  <span className="font-mono text-xs font-black text-amber-300">{pillar.id}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors mb-1.5">
                    {isHindi ? pillar.titleHi : pillar.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                    {isHindi ? pillar.descHi : pillar.descEn}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          to="/about"
          className="btn-secondary !py-2.5 !px-5 !text-xs inline-flex items-center gap-2"
        >
          <span>{isHindi ? "विस्तृत उद्देश्य व नियम पढ़ें" : "View Samiti Objectives"}</span>
          <FiArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

export default HomePillarsSection;
