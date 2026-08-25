import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight,
  FiSun,
  FiShield,
  FiUsers,
  FiBookOpen,
  FiHeart,
  FiImage,
  FiLayers,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";
import { useLanguage } from "../../../i18n/LanguageContext";
import { useTheme } from "../../../Utilities/useTheme";

/**
 * HERO SLIDES DATA STRUCTURE
 * -------------------------------------------------------------
 * Easy to replace images: Simply change the `image` field.
 * If `image: null`, the component renders an elegant dark archival placeholder.
 * `objectPosition` can be configured per slide (e.g. "top center", "center 30%").
 */
export const heroSlidesData = [
  {
    id: "balinath-ji",
    image: "/balinathjimaharaj.jpg",
    objectPosition: "top center",
    badgeIcon: FiSun,
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    eyebrow: {
      hi: "परम पूज्य संत एवं पथ-प्रदर्शक",
      en: "Revered Spiritual Guide & Social Reformer",
    },
    title: {
      hi: "महर्षि बालीनाथ जी महाराज",
      en: "Maharshi Balinath Ji Maharaj",
    },
    highlight: {
      hi: "मण्डावरी धाम (दौसा) • जीवन दर्शन व चेतना",
      en: "Mandawari Dham • Sacred Teachings & Guidance",
    },
    description: {
      hi: "शिक्षा, नशा मुक्ति, कुरीतियों के उन्मूलन एवं श्रम स्वावलंबन के अमर प्रणेता। मण्डावरी धाम समाज का परम पावन तीर्थ एवं आध्यात्मिक आस्था का केंद्र है।",
      en: "Champion of mass education, social reform, dignity, and agricultural self-reliance. Mandawari Dham is the revered pilgrimage site of Bairwa Samaaj.",
    },
    primaryBtn: {
      textHi: "जीवन दर्शन एवं उपदेश",
      textEn: "Explore Life & Teachings",
      link: "/balinath",
    },
    secondaryBtn: {
      textHi: "इतिहास व विरासत",
      textEn: "History & Heritage",
      link: "/history",
    },
  },
  {
    id: "prantiya-sanstha",
    image: null,
    objectPosition: "center",
    badgeIcon: FiShield,
    badgeColor: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    eyebrow: {
      hi: "प्रांतीय बैरवा प्रगति संस्था (राजस्थान)",
      en: "Prantiya Bairwa Pragati Sanstha, Rajasthan",
    },
    title: {
      hi: "एकता, शिक्षा एवं स्वाभिमान",
      en: "Unity, Education & Self-Respect",
    },
    highlight: {
      hi: "पंजीकृत प्रांतीय सामाजिक संस्थान",
      en: "Official State Social Organization",
    },
    description: {
      hi: "बैरवा समाज के सर्वांगीण उत्थान, युवाओं के मार्गदर्शन, पारिवारिक संबल और संगठनात्मक एकता हेतु समर्पित आधिकारिक डिजिटल मंच।",
      en: "Dedicated to the comprehensive upliftment, youth empowerment, family welfare, and organizational unity of Bairwa Samaaj.",
    },
    primaryBtn: {
      textHi: "संस्था से जुड़ें / सदस्यता",
      textEn: "Join Samaj Membership",
      link: "/signup",
      authLink: "/dashboard/my-profile",
    },
    secondaryBtn: {
      textHi: "प्रदेश कार्यकारिणी",
      textEn: "Executive Committee",
      link: "/management-committee",
    },
  },
  {
    id: "education-youth",
    image: null,
    objectPosition: "center",
    badgeIcon: FaGraduationCap,
    badgeColor: "text-sky-400 border-sky-500/30 bg-sky-500/10",
    eyebrow: {
      hi: "शिक्षा प्रोत्साहन एवं प्रतिभा सम्मान",
      en: "Education Aid & Talent Felicitation",
    },
    title: {
      hi: "शिक्षा ही समाज की शक्ति है",
      en: "Education is Community Empowerment",
    },
    highlight: {
      hi: "छात्रवृत्ति, करियर संबल व मेधावी सम्मान",
      en: "Scholarships, Career Guidance & Honors",
    },
    description: {
      hi: "मेधावी छात्र-छात्राओं को छात्रवृत्ति सहायता, प्रतियोगी परीक्षाओं हेतु मार्गदर्शन और प्रशासनिक व उच्च सेवाओं में चयनित प्रतिभाओं का सम्मान।",
      en: "Financial assistance for meritorious students, competitive guidance, and felicitation of community achievers across civil and public services.",
    },
    primaryBtn: {
      textHi: "छात्रवृत्ति योजनाएं",
      textEn: "View Scholarships",
      link: "/scholarships",
    },
    secondaryBtn: {
      textHi: "रोजगार एवं करियर",
      textEn: "Jobs & Careers",
      link: "/jobs",
    },
  },
  {
    id: "welfare-matrimonial",
    image: null,
    objectPosition: "center",
    badgeIcon: FiHeart,
    badgeColor: "text-rose-400 border-rose-500/30 bg-rose-500/10",
    eyebrow: {
      hi: "सामाजिक कल्याण एवं सेवा प्रकल्प",
      en: "Social Welfare & Community Facilities",
    },
    title: {
      hi: "वैवाहिक मंच एवं धर्मशाला व्यवस्था",
      en: "Matrimonial Platform & Pilgrim Care",
    },
    highlight: {
      hi: "सत्यापित रिश्ते • अतिथि गृह बुकिंग",
      en: "Verified Matchmaking • Guest House Accommodations",
    },
    description: {
      hi: "पारदर्शी व सुरक्षित वैवाहिक संबंध बायोडाटा, तीर्थ स्थलों व शहरों में धर्मशाला अतिथि गृह बुकिंग तथा समाज कल्याण कोष।",
      en: "Secure community matchmaking portal, convenient Dharamshala booking across pilgrim destinations, and social welfare support.",
    },
    primaryBtn: {
      textHi: "वैवाहिक मंच देखें",
      textEn: "Matrimonial Portal",
      link: "/matrimonial",
    },
    secondaryBtn: {
      textHi: "धर्मशाला बुकिंग",
      textEn: "Dharamshala Booking",
      link: "/dharamshala",
    },
  },
  {
    id: "gotra-heritage",
    image: null,
    objectPosition: "center",
    badgeIcon: FiLayers,
    badgeColor: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    eyebrow: {
      hi: "गौरवशाली इतिहास व सांस्कृतिक विरासत",
      en: "Historical Heritage & Gotra Archive",
    },
    title: {
      hi: "101 प्रामाणिक गोत्र डायरेक्टरी",
      en: "101 Authentic Gotra Directory",
    },
    highlight: {
      hi: "वंशावली, ऐतिहासिक कालक्रम व पहचान",
      en: "Genealogy, Historical Timeline & Identity",
    },
    description: {
      hi: "बैरवा समाज के 101 प्रामाणिक गोत्रों का आधिकारिक संकलन, ऐतिहासिक परंपराएं एवं पारिवारिक वंशावली वृक्ष का डिजिटल संरक्षण।",
      en: "Official documentation of 101 authentic Bairwa gotras, ancient heritage archives, and digital family lineage preservation.",
    },
    primaryBtn: {
      textHi: "101 गोत्र सूची देखें",
      textEn: "Explore Gotra Directory",
      link: "/gotras",
    },
    secondaryBtn: {
      textHi: "समाज का इतिहास",
      textEn: "Community History",
      link: "/history",
    },
  },
];

const HeroCarousel = () => {
  const { isHindi } = useLanguage();
  const { isDark } = useTheme();
  const { token } = useSelector((state) => state.auth);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const totalSlides = heroSlidesData.length;
  const currentSlide = heroSlidesData[currentIndex];
  const BadgeIcon = currentSlide.badgeIcon || FiShield;

  // Auto slide effect every 7 seconds
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, isPaused, totalSlides]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const handleSelectSlide = (idx) => {
    setCurrentIndex(idx);
  };

  return (
    /* ====================================================================
       1. UNIFIED HERO GLASSMORPHISM CONTAINER (CARD)
       ==================================================================== */
    <div
      className="hero-glass-card relative w-full rounded-3xl sm:rounded-[36px] overflow-hidden select-none transition-all duration-300"
      style={{
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Bairwa Samaj Hero Showcase"
    >
      {/* Contained Hero Height Wrapper */}
      <div className="relative w-full min-h-[500px] sm:min-h-[560px] lg:min-h-[600px] flex items-center overflow-hidden">
        
        {/* ================= 2. CONTAINED IMAGE LAYER & OVERLAYS ================= */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            {currentSlide.image ? (
              <img
                src={currentSlide.image}
                alt={isHindi ? currentSlide.title.hi : currentSlide.title.en}
                style={{ objectPosition: currentSlide.objectPosition || "center" }}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              /* Ultra-Clean Institutional Skeleton / Archival Placeholder */
              <div className={`w-full h-full flex flex-col items-center justify-center relative ${isDark ? "bg-gradient-to-br from-[#121c17] via-[#0b1310] to-[#060a08]" : "bg-gradient-to-br from-[#e8f0ed] via-[#eef4f1] to-[#f4f9f6]"}`}>
                {/* Subtle Heritage Lattice Texture */}
                <div
                  className="absolute inset-0 opacity-[0.05] pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(${isDark ? "#10b981" : "#00b887"} 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                  }}
                />
                <div className={`relative z-10 flex flex-col items-center justify-center p-6 text-center max-w-sm rounded-3xl ${isDark ? "border border-white/5 bg-white/[0.02]" : "border border-black/8 bg-white/60 shadow-sm"}`}>
                  <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 shadow-inner">
                    <FiImage size={28} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-1">
                    {isHindi ? "संस्था छायाचित्र दीर्घा" : "Official Archival Showcase"}
                  </span>
                  <p className={`text-[11px] ${isDark ? "text-white/40" : "text-black/45"}`}>
                    {isHindi
                      ? "संस्था द्वारा आधिकारिक छायाचित्र शीघ्र ही यहाँ प्रदर्शित किया जाएगा।"
                      : "Official archival photograph will be updated by the administration."}
                  </p>
                </div>
              </div>
            )}

            {/* Cinematic Gradient Overlay — stronger in dark mode, softer in light for readability */}
            <div className={`absolute inset-0 ${
              isDark
                ? "bg-gradient-to-t from-[#070b09] via-[#070b09]/85 to-[#070b09]/40 lg:bg-gradient-to-r lg:from-[#070b09]/95 lg:via-[#070b09]/80 lg:to-black/30"
                : "bg-gradient-to-t from-black/80 via-black/55 to-black/25 lg:bg-gradient-to-r lg:from-black/85 lg:via-black/60 lg:to-black/20"
            }`} />
            <div className={`absolute inset-0 ${isDark ? "bg-black/25" : "bg-black/15"}`} />
          </motion.div>
        </AnimatePresence>

        {/* ================= 3. CONTENT LAYER (BOUND INSIDE THE CARD) ================= */}
        <div className="relative z-10 w-full px-5 sm:px-10 lg:px-14 py-16 sm:py-20 lg:py-24">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Text & Action Area */}
            <div className="lg:col-span-8 flex flex-col items-start text-left">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id + "-content"}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="space-y-3 sm:space-y-4 max-w-2xl"
                >
                  {/* Eyebrow Badge */}
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold ${currentSlide.badgeColor} backdrop-blur-md`}
                  >
                    <BadgeIcon size={13} />
                    <span>{isHindi ? currentSlide.eyebrow.hi : currentSlide.eyebrow.en}</span>
                  </div>

                  {/* Main Title */}
                  {/* text-white is intentional here — content sits on a dark overlay so stays white in both themes */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-[1.15] font-serif">
                    {isHindi ? currentSlide.title.hi : currentSlide.title.en}
                  </h1>

                  {/* Highlight Subtitle */}
                  <h2 className="text-sm sm:text-base md:text-lg font-bold text-emerald-400 tracking-wide">
                    {isHindi ? currentSlide.highlight.hi : currentSlide.highlight.en}
                  </h2>

                  {/* Description Paragraph */}
                  <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal pt-1 max-w-xl">
                    {isHindi ? currentSlide.description.hi : currentSlide.description.en}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-3 sm:pt-5">
                    {/* Primary Button */}
                    <Link
                      to={token && currentSlide.primaryBtn.authLink ? currentSlide.primaryBtn.authLink : currentSlide.primaryBtn.link}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-950/50 hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all"
                    >
                      <span>{isHindi ? currentSlide.primaryBtn.textHi : currentSlide.primaryBtn.textEn}</span>
                      <FiArrowRight size={15} />
                    </Link>

                    {/* Secondary Button */}
                    <Link
                      to={currentSlide.secondaryBtn.link}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white backdrop-blur-sm transition-all"
                    >
                      <span>{isHindi ? currentSlide.secondaryBtn.textHi : currentSlide.secondaryBtn.textEn}</span>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Floating Portrait Frame (When on slide with image like Balinath Ji) */}
            {currentSlide.image && (
              <div className="hidden lg:flex lg:col-span-4 justify-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="w-56 aspect-[9/14] rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-black/80 shadow-2xl relative group"
                >
                  <img
                    src={currentSlide.image}
                    alt={isHindi ? currentSlide.title.hi : currentSlide.title.en}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-4 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">
                      {isHindi ? "परम पावन स्वरूप" : "Revered Sacred Portrait"}
                    </span>
                    <h3 className="text-xs font-bold text-white mt-0.5">
                      {isHindi ? currentSlide.title.hi : currentSlide.title.en}
                    </h3>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* ================= 4. CIRCULAR GLASS NAVIGATION BUTTONS ================= */}
        {/* Navigation arrows — always dark-glass because they sit on image overlay */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/85 hover:text-white hover:bg-black/70 hover:border-white/35 backdrop-blur-md shadow-lg transition-all cursor-pointer"
        >
          <FiChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/85 hover:text-white hover:bg-black/70 hover:border-white/35 backdrop-blur-md shadow-lg transition-all cursor-pointer"
        >
          <FiChevronRight size={18} />
        </button>

        {/* ================= 5. PROGRESS PILL INDICATORS (INSIDE CARD) ================= */}
        <div className="absolute bottom-3 sm:bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-1.5 sm:gap-2.5">
          {heroSlidesData.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => handleSelectSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="group p-1.5 focus:outline-none cursor-pointer"
              >
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 sm:w-10 bg-emerald-400 shadow-sm shadow-emerald-400/50"
                      : `w-2 sm:w-2.5 bg-white/30 group-hover:bg-white/60`
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
