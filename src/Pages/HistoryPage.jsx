import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiClock,
  FiShield,
  FiMapPin,
  FiBarChart2,
  FiArrowRight,
  FiCheckCircle,
  FiTrendingUp,
} from "react-icons/fi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { halbaHistoricalPhases, organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";
import { useScrollReveal } from "../Utilities/useScrollReveal";

const HistoryPage = () => {
  const { isHindi } = useLanguage();
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const census = organizationInfo.census2011;

  const historySections = [
    {
      id: "01",
      titleHi: "01. पहचान एवं भौगोलिक विस्तार",
      titleEn: "01. Identity & Geographical Presence",
      contentHi:
        "हल्बा (जिन्हें हल्बी भी लिखा जाता है) मध्य एवं पूर्वी भारत का एक ऐतिहासिक रूप से स्थापित अनुसूचित जनजाति समुदाय है। यह समुदाय मुख्य रूप से छत्तीसगढ़, महाराष्ट्र एवं मध्य प्रदेश में केंद्रित है। भारत सरकार की अनुसूचित जनजाति सूची में 'Halba, Halbi' प्रविष्टि सम्मिलित है।",
      contentEn:
        "Halba, also written Halbi, is a tribal community historically rooted in Central and Eastern India, most closely associated with Chhattisgarh, Maharashtra and Madhya Pradesh. The Government of India lists Halba/Halbi under the Scheduled Tribes Order.",
      accentColor: "emerald",
    },
    {
      id: "02",
      titleHi: "02. नाम का अर्थ एवं कृषक विरासत",
      titleEn: "02. Meaning & Agricultural Roots",
      contentHi:
        "हल्बा नाम की सर्वविदित व्याख्या 'हल' (कृषि) से जुड़ी है, जो समुदाय की दीर्घकालीन कृषि परंपरा को दर्शाती है। रसेल व हीरालाल के ऐतिहासिक नृवंशविज्ञान में समुदाय की उत्पत्ति से जुड़ी विभिन्न मौखिक परंपराएं संकलित हैं।",
      contentEn:
        "The name Halba is commonly associated with agricultural heritage ('Hal' / plough), reflecting centuries of farming traditions. Historical literature preserves multiple oral origin traditions regarding the community's early settlement.",
      accentColor: "amber",
    },
    {
      id: "03",
      titleHi: "03. प्रारंभिक गृहक्षेत्र एवं उपसमूह",
      titleEn: "03. Early Homeland & Regional Subgroups",
      contentHi:
        "ऐतिहासिक साहित्य के अनुसार हल्बा का आरंभिक गृहक्षेत्र दक्षिण रायपुर, कांकेर, बस्तर एवं सिहावा के आसपास रहा। आगे चलकर भंडारा व विदर्भ की ओर प्रसार हुआ। बस्तरिया, छत्तीसगढ़िया, मरेठिया, पेन्तिया जैसे उपसमूहों का उल्लेख मिलता है।",
      contentEn:
        "Ethnographic literature places an early Halba homeland around southern Raipur, Kanker, Bastar, and Sihawa, with later movement toward Bhandara and Berar (Maharashtra). Regional classifications record Bastaria, Chhattisgarhia, Marethia, Pentia, and related occupational groups.",
      accentColor: "sky",
    },
    {
      id: "04",
      titleHi: "04. बस्तर से ऐतिहासिक जुड़ाव",
      titleEn: "04. Historic Bond with Bastar",
      contentHi:
        "बस्तर हल्बा ऐतिहासिक स्मृति का केंद्रीय स्तंभ है। यह क्षेत्र समाज के कृषक जीवन, रियासती सुरक्षा सेवा, हल्बी संपर्क भाषा और 1774–1779 की ऐतिहासिक हल्बा क्रांति से अभिन्न रूप से जुड़ा हुआ है।",
      contentEn:
        "Bastar occupies a central place in Halba historical memory — linked to the community's agricultural life, military traditions, language, and the 1774–1779 rebellion. Halbi functioned as a regional lingua franca across Bastar.",
      accentColor: "purple",
    },
    {
      id: "05",
      titleHi: "05. 1774–1779 हल्बा क्रांति (डोंगर संघर्ष)",
      titleEn: "05. Halba Rebellion (1774–1779)",
      contentHi:
        "1774–1779 की हल्बा क्रांति बस्तर क्षेत्र में राजवंशीय संघर्ष के दौर में हुआ एक प्रमुख जन-विद्रोह था। डोंगर के अजमेर सिंह के नेतृत्व में हल्बा सैनिकों व समुदाय ने निर्णायक भूमिका निभाई। यह छत्तीसगढ़ में जनजातीय प्रतिरोध की ऐतिहासिक स्मृति में अत्यंत महत्वपूर्ण स्थान रखता है।",
      contentEn:
        "The Halba Rebellion of 1774–1779 was a major uprising in the Bastar region during a period of dynastic conflict. Led by Ajmer Singh of Dongar, it occupies an important place in the historical memory of tribal resistance in Chhattisgarh.",
      accentColor: "rose",
    },
    {
      id: "06",
      titleHi: "06. आजीविका में बदलाव",
      titleEn: "06. Livelihood Evolution",
      contentHi:
        "पारंपरिक रूप से कृषि, सैन्य सेवा, वनोपज एवं बुनाई से जुड़े हल्बा समाज ने आधुनिक काल में व्यापक सामाजिक-आर्थिक विविधता अर्जित की है। आज समाज के युवा प्रशासनिक सेवाओं, उच्च शिक्षा, व्यापार एवं चिकित्सा में अग्रणी भूमिका निभा रहे हैं।",
      contentEn:
        "Historically engaged in agriculture, militia service, weaving, and forest produce, the contemporary Halba community has diversified into public administration, higher education, technology, healthcare, and modern entrepreneurship.",
      accentColor: "teal",
    },
  ];

  const accentMap = {
    emerald: { badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", bar: "bg-emerald-500" },
    amber: { badge: "border-amber-500/30 bg-amber-500/10 text-amber-400", bar: "bg-amber-500" },
    sky: { badge: "border-sky-500/30 bg-sky-500/10 text-sky-400", bar: "bg-sky-500" },
    purple: { badge: "border-purple-500/30 bg-purple-500/10 text-purple-400", bar: "bg-purple-500" },
    rose: { badge: "border-rose-500/30 bg-rose-500/10 text-rose-400", bar: "bg-rose-400" },
    teal: { badge: "border-teal-500/30 bg-teal-500/10 text-teal-400", bar: "bg-teal-500" },
  };

  const delayClasses = [
    "reveal-delay-1","reveal-delay-2","reveal-delay-3","reveal-delay-4",
    "reveal-delay-5","reveal-delay-6","reveal-delay-7","reveal-delay-8",
  ];

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300"
    >
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative pt-24 sm:pt-32 pb-14 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300 mb-5">
            <FiBookOpen size={13} />
            <span>{isHindi ? "प्रमाणित जनजातीय इतिहास व सामाजिक विकास" : "Verified Tribal History & Social Journey"}</span>
          </div>

          <h1 className="reveal text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight mb-4">
            {isHindi
              ? <>आदिवासी हल्बा/<span className="gradient-text-brand">हल्बी समाज</span> का इतिहास</>
              : <>History of the <span className="gradient-text-brand">Halba / Halbi</span> Community</>}
          </h1>

          <p className="reveal reveal-delay-1 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
            {isHindi
              ? "“गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं” — मध्य भारत के वनांचलों से लेकर संवैधानिक मान्यता, 1774–1779 क्रांति एवं उज्जैन समिति की स्थापना तक।"
              : "An authentic, documented history compiled from government census profiles, historical ethnography, constitutional records, and tribal research archives."}
          </p>

          {/* Quick Nav Badges */}
          <div className="reveal reveal-delay-2 mt-7 flex flex-wrap items-center justify-center gap-2.5 text-xs">
            {[
              { to: "/heritage", hi: "बस्तर धरोहर एवं 1774 क्रांति", en: "Bastar Heritage & 1774 Rebellion" },
              { to: "/culture", hi: "संस्कृति, दनकुल व पर्व", en: "Culture, Dankul & Festivals" },
              { to: "/constitutional-status", hi: "संवैधानिक दर्जा", en: "Constitutional Status & Census" },
              { to: "/about", hi: "उज्जैन समिति (1979-2025)", en: "Ujjain Samiti Journey" },
            ].map((b, i) => (
              <Link
                key={i}
                to={b.to}
                className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-amber-500/40 hover:text-amber-300 text-[var(--text-secondary)] transition-colors"
              >
                {isHindi ? b.hi : b.en}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── MAIN NARRATIVE + SIDEBAR ───────────────── */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Left: Narrative Blocks */}
          <div className="lg:col-span-8 space-y-5">
            {historySections.map((sec, idx) => {
              const accent = accentMap[sec.accentColor] || accentMap.emerald;
              return (
                <div
                  key={sec.id}
                  className={`reveal ${delayClasses[idx % 8]} hover-lift ka-card p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] flex gap-4`}
                >
                  {/* Color bar */}
                  <div className={`flex-shrink-0 w-1 rounded-full self-stretch ${accent.bar} opacity-70`} />
                  <div className="space-y-3 min-w-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${accent.badge}`}>
                      {sec.id}
                    </span>
                    <h3 className="font-black text-base sm:text-lg text-[var(--text-primary)]">
                      {isHindi ? sec.titleHi : sec.titleEn}
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
                      {isHindi ? sec.contentHi : sec.contentEn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Census Card */}
            <div className="reveal ka-card p-6 rounded-3xl border border-emerald-500/30 bg-[var(--surface-elevated)] space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <FiBarChart2 size={15} />
                <span>{isHindi ? "जनगणना 2011 आंकड़े" : "Census 2011 (Govt. Record)"}</span>
              </div>
              <h4 className="font-bold text-sm text-[var(--text-primary)]">
                {isHindi ? "शासकीय सांख्यिकी प्रोफाइल" : "Statistical Profile of Halba ST"}
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] italic">
                {isHindi ? census.notesHi : census.notes}
              </p>
              <div className="space-y-2 text-xs">
                {[
                  { label: isHindi ? "कुल ST जनसंख्या:" : "Total ST Population:", val: "6,50,631", color: "text-emerald-400 font-black" },
                  { label: isHindi ? "मध्य प्रदेश:" : "Madhya Pradesh:", val: "14,438", color: "font-bold" },
                  { label: isHindi ? "महाराष्ट्र:" : "Maharashtra:", val: "2,61,011", color: "font-bold" },
                  { label: isHindi ? "छत्तीसगढ़:" : "Chhattisgarh:", val: "~3,75,182", color: "font-bold" },
                  { label: isHindi ? "हल्बी मातृभाषा भाषी:" : "Halbi Speakers:", val: "7,66,297", color: "text-sky-400 font-bold" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">{row.label}</span>
                    <span className={`font-mono ${row.color} text-[var(--text-primary)]`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subgroups Card */}
            <div className="reveal reveal-delay-1 ka-card p-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs space-y-3">
              <span className="font-bold text-[var(--text-primary)] block border-b border-[var(--border-subtle)] pb-2">
                {isHindi ? "ऐतिहासिक क्षेत्रीय उपसमूह" : "Historical Regional Subgroups"}
              </span>
              <ul className="space-y-2 text-[var(--text-secondary)] text-[11px]">
                {[
                  ["बस्तरिया / बस्तरहा", "बस्तर सांस्कृतिक अंचल"],
                  ["छत्तीसगढ़िया", "छत्तीसगढ़ के मैदानी भाग"],
                  ["मरेठिया / मराठिया", "भंडारा व महाराष्ट्र"],
                  ["पेन्तिया", "ओडिशा संबंधित आबादी"],
                  ["बुनकर / तेलिया", "व्यावसायिक परंपराएं"],
                ].map(([name, area], i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[var(--accent-primary)] mt-0.5">•</span>
                    <span><strong className="text-[var(--text-primary)]">{name}:</strong> {area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div className="reveal reveal-delay-2 flex flex-col gap-2">
              <Link to="/heritage" className="btn-primary text-xs justify-center">
                <span>{isHindi ? "बस्तर धरोहर विस्तार से पढ़ें" : "Explore Bastar Heritage"}</span>
                <FiArrowRight size={13} />
              </Link>
              <Link to="/constitutional-status" className="btn-secondary text-xs justify-center">
                <span>{isHindi ? "संवैधानिक दर्जा" : "Constitutional Status"}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────── 7 HISTORICAL PHASES ───────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-bold text-sky-400 mb-3">
            <FiClock size={13} />
            <span>{isHindi ? "इतिहास के 7 प्रमुख कालखंड" : "Seven Historical Phases"}</span>
          </div>
          <h2 className="reveal reveal-delay-1 text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "हल्बा/हल्बी समाज की विकास यात्रा के सात चरण" : "Seven Phases of Community Evolution"}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {halbaHistoricalPhases.map((phase, idx) => (
            <div
              key={idx}
              className={`reveal ${delayClasses[idx % 8]} hover-lift ka-card p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] flex flex-col gap-3 group`}
            >
              <span className="text-[10px] font-mono font-bold uppercase text-[var(--accent-primary)] px-2 py-0.5 rounded-md bg-[var(--accent-primary)]/10 self-start border border-[var(--accent-primary)]/20">
                {phase.phase}
              </span>
              <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                {phase.titleHi}
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed flex-1">
                {phase.descHi}
              </p>
              <div className="h-0.5 w-full rounded-full bg-gradient-to-r from-[var(--accent-primary)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default HistoryPage;
