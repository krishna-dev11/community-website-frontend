import React from "react";
import { Link } from "react-router-dom";
import { FiSun, FiArrowRight } from "react-icons/fi";
import { GiTempleDoor } from "react-icons/gi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeHeritageFaithSection = () => {
  const { isHindi } = useLanguage();

  const sacredTraditions = [
    {
      nameHi: "ग्राम देव (दूल्हा देव)",
      nameEn: "Gram Dev (Dulha Dev)",
      roleHi: "ग्राम एवं कुल रक्षक",
      descHi: "गांव एवं कुल की रक्षा करने वाले पारंपरिक ग्राम देवता के रूप में श्रद्धापूर्वक पूजित।",
      descEn: "Revered as traditional village guardian divinity across indigenous Halba settlements.",
    },
    {
      nameHi: "मोथो देव (बड़ा देव)",
      nameEn: "Motho Dev (Bada Dev)",
      roleHi: "सर्वोच्च कुल देव",
      descHi: "समस्त सृष्टि, प्रकृति एवं आदि शक्तियों के प्रतीक सर्वोच्च कुल देवता के रूप में प्रतिष्ठा।",
      descEn: "Supreme lineage deity symbolizing cosmos, nature, and primeval spiritual roots.",
    },
    {
      nameHi: "कारू बोआ",
      nameEn: "Karu Boa",
      roleHi: "आदिवासी कुल आराध्य",
      descHi: "आदिवासी हलबा/हलबी समाज के पवित्र कुल आराध्य, जिनकी पूजा विशेष अनुष्ठानों में होती है।",
      descEn: "Sacred ancestral lineage divinity worshipped during special cultural rituals.",
    },
    {
      nameHi: "श्री विट्ठल-रुक्मिणी मंदिर",
      nameEn: "Shri Vitthal-Rukmani Mandir",
      roleHi: "उज्जैन पावन धाम",
      descHi: "उज्जैन धर्मशाला परिसर में 27 मई 2013 को प्राण-प्रतिष्ठित पावन मंदिर, जो सामाजिक आस्था का केंद्र है।",
      descEn: "Consecrated on 27 May 2013 at Ujjain complex, serving as community spiritual center.",
    },
  ];

  return (
    <section className="py-10 sm:py-14">
      {/* Section Header with Classical Divider */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
          <FiSun size={13} />
          <span>{isHindi ? "धार्मिक एवं सांस्कृतिक आस्था" : "Community Heritage & Faith"}</span>
          <span>❖</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          {isHindi ? "हमारी आस्था और विरासत" : "Our Sacred Faith & Heritage"}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-3 text-amber-500/60">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
          <span className="text-xs">♦ ❖ ♦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
        </div>
      </div>

      <div className="p-5 sm:p-8 lg:p-10 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface-elevated)] shadow-xl relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: Shri Vitthal-Rukmani Mandir Photograph */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-black shadow-lg group">
              <img
                src="/images/vitthal_mandir.jpg"
                alt="Shri Vitthal Rukmani Mandir Ujjain Sanctum"
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/40 text-[10px] font-black text-amber-300 flex items-center gap-1.5">
                <GiTempleDoor size={13} />
                <span>प्राण-प्रतिष्ठा: 27 मई 2013</span>
              </div>

              <div className="absolute bottom-3 inset-x-3 text-white text-left">
                <h4 className="text-sm font-black text-amber-200">
                  श्री विट्ठल-रुक्मिणी मंदिर, उज्जैन धाम
                </h4>
                <p className="text-[11px] text-emerald-100/80 mt-0.5">
                  आदिवासी हलबा/हलबी समाज की सामूहिक आध्यात्मिक आस्था का प्रमुख केंद्र
                </p>
              </div>
            </div>
          </div>

          {/* Right: Deities Cards */}
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
              {isHindi
                ? "आदिवासी हलबा/हलबी समाज की समृद्ध सांस्कृतिक एवं धार्मिक परंपराओं में प्रकृति, कुल देव एवं सनातन आस्था का अनूठा संगम है। उज्जैन परिसर में श्री विट्ठल-रुक्मिणी मंदिर समाज की सामूहिक आस्था का गौरवमयी केंद्र है।"
                : "Halba/Halbi traditions preserve a sacred continuity of ancestral deities and devotional faith. Shri Vitthal-Rukmani Mandir at the Ujjain campus is the central spiritual sanctuary of the Samiti."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {sacredTraditions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border-2 border-amber-500/20 bg-[var(--surface)] hover:border-amber-400/40 hover:shadow-md transition-all text-left shadow-sm group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors">
                      {isHindi ? item.nameHi : item.nameEn}
                    </h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold">
                      {item.roleHi}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-snug font-normal">
                    {isHindi ? item.descHi : item.descEn}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/faith" className="btn-primary !py-2.5 !px-5 !text-xs">
                <span>{isHindi ? "आस्था एवं परंपराएं जानें" : "Explore Sacred Traditions"}</span>
                <FiArrowRight size={14} />
              </Link>
              <Link to="/gotras" className="btn-secondary !py-2.5 !px-5 !text-xs">
                <span>{isHindi ? "गोत्र एवं कुल व्यवस्था" : "Gotra & Clans"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHeritageFaithSection;
