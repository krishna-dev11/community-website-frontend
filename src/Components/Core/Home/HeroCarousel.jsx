import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiLayers,
  FiMapPin,
  FiShield,
  FiStar,
  FiSun,
  FiUsers,
} from "react-icons/fi";
import { FaGraduationCap, FaHandsHelping } from "react-icons/fa";
import { useLanguage } from "../../../i18n/LanguageContext";
import { useTheme } from "../../../Utilities/useTheme";

/**
 * Bairwa Samaj — Premium Home Hero
 * ---------------------------------------------------------------------------
 * This is a visual-first replacement for the old placeholder-based carousel.
 *
 * Important:
 * - Existing Balinath image is preserved.
 * - Other slides use relevant public web imagery rather than fake/demo people.
 * - No fake backend statistics are shown.
 * - Existing routes and Redux auth behavior are preserved.
 * - If you later have real backend hero data, plug it into HERO_SLIDES without
 *   changing the rendering system.
 */

const WEB_IMAGES = {
  heritage:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Rajasthan_Fort.jpg",
  heritageWide:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Jaigarh_Fort_Jaipur.jpg",
  community:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Women_of_Rajasthan%2C_near_Jaipur%2C_India.jpg",
  communityWide:
    "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ladies_of_Rajasthan%2C_India.jpg",
  education:
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1600&q=85",
};

const FALLBACK_IMAGE = "/balinathjimaharaj.jpg";

const HERO_SLIDES = [
  {
    id: "balinath",
    theme: "amber",
    image: "/balinathjimaharaj.jpg",
    background: "/balinathjimaharaj.jpg",
    imagePosition: "center 22%",
    eyebrowHi: "परम पूज्य संत एवं पथ-प्रदर्शक",
    eyebrowEn: "REVERED SPIRITUAL GUIDE & SOCIAL REFORMER",
    titleHi: "महर्षि बालीनाथ जी महाराज",
    titleEn: "Maharshi Balinath Ji Maharaj",
    highlightHi: "मण्डावरी धाम • जीवन दर्शन एवं चेतना",
    highlightEn: "Mandawari Dham • Sacred Teachings & Guidance",
    descriptionHi:
      "शिक्षा, सामाजिक सुधार, आत्मसम्मान और स्वावलंबन की प्रेरणा देने वाली महान विरासत को नई पीढ़ी तक पहुंचाने का डिजिटल प्रयास।",
    descriptionEn:
      "A digital effort to carry forward a legacy of education, social reform, dignity and self-reliance for the next generation.",
    primaryHi: "जीवन दर्शन देखें",
    primaryEn: "Explore Life & Teachings",
    primaryLink: "/balinath",
    secondaryHi: "इतिहास एवं विरासत",
    secondaryEn: "History & Heritage",
    secondaryLink: "/history",
    visualLabelHi: "पावन विरासत",
    visualLabelEn: "SACRED HERITAGE",
    visualTextHi: "आस्था • प्रेरणा • समाज सुधार",
    visualTextEn: "Faith • Inspiration • Social Reform",
    chips: [
      ["आध्यात्मिक विरासत", "Spiritual Heritage", FiSun],
      ["समाज सुधार", "Social Reform", FiShield],
      ["शिक्षा प्रेरणा", "Education", FaGraduationCap],
    ],
  },
  {
    id: "institution",
    theme: "emerald",
    image: WEB_IMAGES.heritageWide,
    background: WEB_IMAGES.heritage,
    imagePosition: "center",
    eyebrowHi: "प्रांतीय बैरवा प्रगति संस्था, राजस्थान",
    eyebrowEn: "PRANTIYA BAIRWA PRAGATI SANSTHA, RAJASTHAN",
    titleHi: "एकता • शिक्षा • स्वाभिमान",
    titleEn: "Unity • Education • Self-Respect",
    highlightHi: "समाज के सर्वांगीण विकास के लिए डिजिटल मंच",
    highlightEn: "A digital platform for comprehensive community development",
    descriptionHi:
      "युवा सशक्तिकरण, शिक्षा, परिवार कल्याण, सामाजिक सेवा और संगठनात्मक एकता को एक आधुनिक डिजिटल मंच से जोड़ने का प्रयास।",
    descriptionEn:
      "Connecting youth empowerment, education, family welfare, social service and organizational unity through one modern digital platform.",
    primaryHi: "संस्था के बारे में",
    primaryEn: "About the Sanstha",
    primaryLink: "/about",
    secondaryHi: "प्रदेश कार्यकारिणी",
    secondaryEn: "Executive Committee",
    secondaryLink: "/management-committee",
    visualLabelHi: "संस्था का डिजिटल मंच",
    visualLabelEn: "DIGITAL SAMAAJ PLATFORM",
    visualTextHi: "सेवा • संगठन • अवसर • विरासत",
    visualTextEn: "Service • Organization • Opportunity • Heritage",
    chips: [
      ["सदस्यता", "Membership", FiUsers],
      ["कार्यकारिणी", "Committee", FiShield],
      ["सामुदायिक सेवा", "Community Service", FaHandsHelping],
    ],
  },
  {
    id: "education",
    theme: "sky",
    image: WEB_IMAGES.education,
    background: WEB_IMAGES.education,
    imagePosition: "center",
    eyebrowHi: "शिक्षा प्रोत्साहन एवं प्रतिभा सम्मान",
    eyebrowEn: "EDUCATION, CAREERS & TALENT",
    titleHi: "शिक्षा से सशक्त समाज",
    titleEn: "Education Builds a Stronger Community",
    highlightHi: "छात्रवृत्ति • करियर • उपलब्धियां",
    highlightEn: "Scholarships • Careers • Achievements",
    descriptionHi:
      "मेधावी विद्यार्थियों को छात्रवृत्ति, करियर मार्गदर्शन और समाज की प्रतिभाओं को सम्मान देने के लिए एक समर्पित डिजिटल स्थान।",
    descriptionEn:
      "A dedicated digital space for scholarships, career guidance and celebrating community achievements.",
    primaryHi: "छात्रवृत्तियां देखें",
    primaryEn: "Explore Scholarships",
    primaryLink: "/scholarships",
    secondaryHi: "उपलब्धियां देखें",
    secondaryEn: "View Achievements",
    secondaryLink: "/achievements",
    visualLabelHi: "युवा शक्ति",
    visualLabelEn: "YOUTH POWER",
    visualTextHi: "ज्ञान से अवसर तक",
    visualTextEn: "From learning to opportunity",
    chips: [
      ["छात्रवृत्ति", "Scholarships", FiStar],
      ["रोजगार", "Jobs", FiBriefcase],
      ["प्रतिभा सम्मान", "Achievements", FiStar],
    ],
  },
  {
    id: "community",
    theme: "cyan",
    image: WEB_IMAGES.community,
    background: WEB_IMAGES.communityWide,
    imagePosition: "center 38%",
    eyebrowHi: "समाज साथ है, हर पड़ाव पर",
    eyebrowEn: "COMMUNITY SUPPORT, EVERY STEP",
    titleHi: "सेवा, सुविधा और समुदाय",
    titleEn: "Community, Care & Convenience",
    highlightHi: "विवाह मंच • धर्मशाला • Community Support",
    highlightEn: "Matrimonial • Dharamshala • Community Support",
    descriptionHi:
      "सुरक्षित वैवाहिक मंच, धर्मशाला सुविधा, सामुदायिक सहयोग, चर्चा और मतदान जैसी सेवाएं एक ही डिजिटल अनुभव में।",
    descriptionEn:
      "Verified matchmaking, Dharamshala facilities, community support, discussions and voting in one digital experience.",
    primaryHi: "कम्युनिटी देखें",
    primaryEn: "Explore Community",
    primaryLink: "/dashboard/community",
    secondaryHi: "धर्मशाला बुकिंग",
    secondaryEn: "Dharamshala Booking",
    secondaryLink: "/dharamshala",
    visualLabelHi: "एक मंच • अनेक सुविधाएं",
    visualLabelEn: "ONE PLATFORM • MANY SERVICES",
    visualTextHi: "परिवार • सुविधा • सहयोग",
    visualTextEn: "Family • Convenience • Support",
    chips: [
      ["विवाह मंच", "Matrimonial", FiHeart],
      ["धर्मशाला", "Dharamshala", FiMapPin],
      ["Community Hub", "Community Hub", FiUsers],
    ],
  },
  {
    id: "heritage",
    theme: "violet",
    image: WEB_IMAGES.heritage,
    background: WEB_IMAGES.heritageWide,
    imagePosition: "center",
    eyebrowHi: "गौरवशाली इतिहास एवं सांस्कृतिक विरासत",
    eyebrowEn: "HISTORY, GOTRA & CULTURAL HERITAGE",
    titleHi: "अपनी जड़ों से जुड़िए",
    titleEn: "Stay Connected to Your Roots",
    highlightHi: "गोत्र • वंशावली • इतिहास",
    highlightEn: "Gotra • Genealogy • History",
    descriptionHi:
      "समाज की पहचान, गोत्र परंपरा, ऐतिहासिक कालक्रम और सांस्कृतिक विरासत को डिजिटल रूप में सुरक्षित रखने का प्रयास।",
    descriptionEn:
      "Preserving community identity, gotra traditions, historical timelines and cultural heritage in a digital archive.",
    primaryHi: "गोत्र डायरेक्टरी देखें",
    primaryEn: "Explore Gotra Directory",
    primaryLink: "/gotra",
    secondaryHi: "समाज का इतिहास",
    secondaryEn: "Community History",
    secondaryLink: "/history",
    visualLabelHi: "हमारी पहचान",
    visualLabelEn: "OUR HERITAGE",
    visualTextHi: "पीढ़ियों की विरासत • डिजिटल भविष्य",
    visualTextEn: "Generations of heritage • Digital future",
    chips: [
      ["गोत्र डायरेक्टरी", "Gotra Directory", FiLayers],
      ["वंशावली", "Genealogy", FiUsers],
      ["इतिहास", "History", FiBookOpen],
    ],
  },
  {
    id: "achievements",
    theme: "blue",
    image: WEB_IMAGES.education,
    background: WEB_IMAGES.community,
    imagePosition: "center",
    eyebrowHi: "समाज की प्रतिभाएं",
    eyebrowEn: "COMMUNITY ACHIEVEMENTS",
    titleHi: "हमारी उपलब्धियां, हमारा गौरव",
    titleEn: "Their Achievements, Our Pride",
    highlightHi: "शिक्षा • खेल • प्रशासन • उत्कृष्टता",
    highlightEn: "Education • Sports • Civil Services • Excellence",
    descriptionHi:
      "समाज के उन सदस्यों को सामने लाएं जिन्होंने शिक्षा, खेल, प्रशासन, व्यवसाय और अन्य क्षेत्रों में उल्लेखनीय उपलब्धियां हासिल की हैं।",
    descriptionEn:
      "Celebrate community members making a mark in education, sports, civil services, business and other fields.",
    primaryHi: "सभी उपलब्धियां देखें",
    primaryEn: "View All Achievements",
    primaryLink: "/achievements",
    secondaryHi: "अपनी उपलब्धि भेजें",
    secondaryEn: "Submit an Achievement",
    secondaryLink: "/dashboard/community",
    visualLabelHi: "समाज का गौरव",
    visualLabelEn: "COMMUNITY PRIDE",
    visualTextHi: "हर उपलब्धि अगली पीढ़ी की प्रेरणा है",
    visualTextEn: "Every achievement inspires the next generation",
    chips: [
      ["शिक्षा", "Education", FaGraduationCap],
      ["खेल", "Sports", FiStar],
      ["सेवा", "Public Service", FiShield],
    ],
  },
  {
    id: "welfare",
    theme: "rose",
    image: WEB_IMAGES.communityWide,
    background: WEB_IMAGES.heritage,
    imagePosition: "center 42%",
    eyebrowHi: "सेवा एवं सामाजिक कल्याण",
    eyebrowEn: "SERVICE & COMMUNITY WELFARE",
    titleHi: "सेवा से बड़ा कोई योगदान नहीं",
    titleEn: "Every Contribution Creates a Difference",
    highlightHi: "सहयोग • कल्याण • सामुदायिक जिम्मेदारी",
    highlightEn: "Support • Welfare • Community Responsibility",
    descriptionHi:
      "शिक्षा, परिवारों, सामाजिक परियोजनाओं और सामुदायिक कल्याण के लिए पारदर्शी सहयोग का डिजिटल माध्यम।",
    descriptionEn:
      "A digital way to support education, families, social projects and community welfare with greater transparency.",
    primaryHi: "सहयोग करें",
    primaryEn: "Donate & Support",
    primaryLink: "/donate",
    secondaryHi: "Community Services",
    secondaryEn: "Community Services",
    secondaryLink: "/dashboard/community",
    visualLabelHi: "सेवा का संकल्प",
    visualLabelEn: "SPIRIT OF SERVICE",
    visualTextHi: "मिलकर समाज को मजबूत बनाएं",
    visualTextEn: "Together, we make the community stronger",
    chips: [
      ["दान एवं सहयोग", "Donations", FiHeart],
      ["कल्याण", "Welfare", FaHandsHelping],
      ["सेवा", "Service", FiShield],
    ],
  },
];

const THEME = {
  amber: {
    dark: {
      accent: "text-amber-300",
      border: "border-amber-300/30",
      soft: "bg-amber-400/10",
      line: "bg-amber-300",
      glow: "bg-amber-400/20",
    },
    light: {
      accent: "text-amber-700",
      border: "border-amber-600/20",
      soft: "bg-amber-500/10",
      line: "bg-amber-600",
      glow: "bg-amber-400/20",
    },
  },
  emerald: {
    dark: {
      accent: "text-emerald-300",
      border: "border-emerald-300/30",
      soft: "bg-emerald-400/10",
      line: "bg-emerald-300",
      glow: "bg-emerald-400/20",
    },
    light: {
      accent: "text-emerald-700",
      border: "border-emerald-600/20",
      soft: "bg-emerald-500/10",
      line: "bg-emerald-600",
      glow: "bg-emerald-400/20",
    },
  },
  sky: {
    dark: {
      accent: "text-sky-300",
      border: "border-sky-300/30",
      soft: "bg-sky-400/10",
      line: "bg-sky-300",
      glow: "bg-sky-400/20",
    },
    light: {
      accent: "text-sky-700",
      border: "border-sky-600/20",
      soft: "bg-sky-500/10",
      line: "bg-sky-600",
      glow: "bg-sky-400/20",
    },
  },
  cyan: {
    dark: {
      accent: "text-cyan-300",
      border: "border-cyan-300/30",
      soft: "bg-cyan-400/10",
      line: "bg-cyan-300",
      glow: "bg-cyan-400/20",
    },
    light: {
      accent: "text-cyan-700",
      border: "border-cyan-600/20",
      soft: "bg-cyan-500/10",
      line: "bg-cyan-600",
      glow: "bg-cyan-400/20",
    },
  },
  violet: {
    dark: {
      accent: "text-violet-300",
      border: "border-violet-300/30",
      soft: "bg-violet-400/10",
      line: "bg-violet-300",
      glow: "bg-violet-400/20",
    },
    light: {
      accent: "text-violet-700",
      border: "border-violet-600/20",
      soft: "bg-violet-500/10",
      line: "bg-violet-600",
      glow: "bg-violet-400/20",
    },
  },
  blue: {
    dark: {
      accent: "text-blue-300",
      border: "border-blue-300/30",
      soft: "bg-blue-400/10",
      line: "bg-blue-300",
      glow: "bg-blue-400/20",
    },
    light: {
      accent: "text-blue-700",
      border: "border-blue-600/20",
      soft: "bg-blue-500/10",
      line: "bg-blue-600",
      glow: "bg-blue-400/20",
    },
  },
  rose: {
    dark: {
      accent: "text-rose-300",
      border: "border-rose-300/30",
      soft: "bg-rose-400/10",
      line: "bg-rose-300",
      glow: "bg-rose-400/20",
    },
    light: {
      accent: "text-rose-700",
      border: "border-rose-600/20",
      soft: "bg-rose-500/10",
      line: "bg-rose-600",
      glow: "bg-rose-400/20",
    },
  },
};

const SmartImage = ({
  src,
  fallback = FALLBACK_IMAGE,
  alt = "",
  className = "",
  objectPosition = "center",
  loading = "lazy",
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      style={{ objectPosition }}
      onError={() => {
        setCurrentSrc((previous) => (previous === fallback ? previous : fallback));
      }}
    />
  );
};

const HeroCarousel = () => {
  const { isHindi } = useLanguage();
  const { isDark } = useTheme();
  const { token } = useSelector((state) => state.auth);
  const reduceMotion = useReducedMotion();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const total = HERO_SLIDES.length;
  const slide = HERO_SLIDES[currentIndex];
  const themeSet = THEME[slide.theme] || THEME.emerald;
  const palette = isDark ? themeSet.dark : themeSet.light;

  const t = useCallback(
    (hi, en) => (isHindi ? hi : en),
    [isHindi]
  );

  const next = useCallback(() => {
    setCurrentIndex((index) => (index + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    setCurrentIndex((index) => (index - 1 + total) % total);
  }, [total]);

  const select = useCallback((index) => {
    if (Number.isInteger(index) && index >= 0 && index < total) {
      setCurrentIndex(index);
    }
  }, [total]);

  useEffect(() => {
    if (paused || reduceMotion) return undefined;

    timerRef.current = window.setInterval(next, 8000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [paused, reduceMotion, next, currentIndex]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [next, prev]);

  const primaryLink = token && slide.primaryLink === "/signup"
    ? "/dashboard/my-profile"
    : slide.primaryLink;

  const backgroundClass = isDark
    ? "bg-[#050807] border-white/[0.10] shadow-black/40"
    : "bg-[#f8fcfa] border-emerald-900/[0.10] shadow-slate-900/10";

  return (
    <section
      className="relative w-full"
      aria-label={t("बैरवा समाज डिजिटल मंच", "Bairwa Samaj Digital Platform")}
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      {/* Outer premium frame */}
      <div
        className={[
          "relative isolate overflow-hidden rounded-[30px] sm:rounded-[38px] lg:rounded-[44px]",
          "border shadow-2xl transition-colors duration-500",
          backgroundClass,
        ].join(" ")}
      >
        {/* Full background */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${slide.id}-bg`}
            className="absolute inset-0"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.02 }}
            transition={{ duration: reduceMotion ? 0 : 0.9 }}
          >
            <SmartImage
              src={slide.background}
              alt=""
              className="h-full w-full object-cover"
              objectPosition={slide.imagePosition}
              loading={currentIndex === 0 ? "eager" : "lazy"}
            />

            <div
              className={[
                "absolute inset-0",
                isDark
                  ? "bg-[linear-gradient(90deg,rgba(2,7,5,.98)_0%,rgba(2,7,5,.91)_34%,rgba(2,7,5,.66)_63%,rgba(2,7,5,.35)_100%)]"
                  : "bg-[linear-gradient(90deg,rgba(246,250,248,.98)_0%,rgba(246,250,248,.88)_34%,rgba(246,250,248,.56)_63%,rgba(246,250,248,.20)_100%)]",
              ].join(" ")}
            />
            <div
              className={[
                "absolute inset-0",
                isDark ? "bg-black/30" : "bg-white/15",
              ].join(" ")}
            />
          </motion.div>
        </AnimatePresence>

        {/* Decorative glows */}
        <div
          className={`pointer-events-none absolute -right-40 -top-44 h-[600px] w-[600px] rounded-full ${palette.glow} blur-[110px] opacity-60`}
        />
        <div
          className={`pointer-events-none absolute -bottom-52 left-1/3 h-[450px] w-[450px] rounded-full ${palette.glow} blur-[110px] opacity-30`}
        />

        {/* Main content */}
        <div className="relative z-10 min-h-[670px] sm:min-h-[650px] lg:min-h-[690px]" aria-live={paused ? "polite" : "off"}>
          <div className="mx-auto grid min-h-[670px] max-w-[1550px] grid-cols-1 items-center gap-8 px-5 py-12 sm:px-8 lg:min-h-[690px] lg:grid-cols-12 lg:gap-8 lg:px-12 xl:px-16">
            {/* LEFT: content */}
            <div className="lg:col-span-7 xl:col-span-7">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${slide.id}-content`}
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -18 }}
                  transition={{ duration: reduceMotion ? 0 : 0.55 }}
                  className="max-w-3xl"
                >
                  {/* Top status row */}
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <div
                      className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-2",
                        "text-[9px] font-black uppercase tracking-[0.16em] backdrop-blur-xl sm:text-[10px]",
                        palette.accent,
                        palette.border,
                        palette.soft,
                      ].join(" ")}
                    >
                      <FiStar size={13} />
                      {t(slide.eyebrowHi, slide.eyebrowEn)}
                    </div>

                    <div
                      className={[
                        "hidden items-center gap-2 rounded-full border px-3 py-2 text-[9px] font-bold uppercase tracking-wider backdrop-blur-xl sm:inline-flex",
                        isDark
                          ? "border-white/10 bg-white/[0.05] text-white/55"
                          : "border-black/10 bg-white/55 text-slate-600",
                      ].join(" ")}
                    >
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      {t("आधिकारिक डिजिटल मंच", "OFFICIAL DIGITAL PLATFORM")}
                    </div>
                  </div>

                  {/* Main title */}
                  <h1
                    className={[
                      "font-serif font-black tracking-[-0.045em] leading-[0.98]",
                      "text-[43px] sm:text-6xl md:text-7xl xl:text-[78px]",
                      isDark ? "text-white" : "text-white",
                    ].join(" ")}
                  >
                    {t(slide.titleHi, slide.titleEn)}
                  </h1>

                  {/* Highlight */}
                  <div className="mt-5 flex items-center gap-3">
                    <span className={`h-px w-10 ${palette.line}`} />
                    <p
                      className={`text-xs font-black uppercase tracking-[0.13em] sm:text-sm ${palette.accent}`}
                    >
                      {t(slide.highlightHi, slide.highlightEn)}
                    </p>
                  </div>

                  <p
                    className={[
                      "mt-5 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8",
                      isDark ? "text-white/70" : "text-slate-700/80",
                    ].join(" ")}
                  >
                    {t(slide.descriptionHi, slide.descriptionEn)}
                  </p>

                  {/* CTA */}
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to={primaryLink}
                      className="group inline-flex min-h-12 items-center gap-2 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-[0_15px_45px_rgba(16,185,129,.25)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_55px_rgba(16,185,129,.35)] sm:px-6 sm:text-sm"
                    >
                      {t(slide.primaryHi, slide.primaryEn)}
                      <FiArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </Link>

                    <Link
                      to={slide.secondaryLink}
                      className={[
                        "inline-flex min-h-12 items-center rounded-2xl border px-5 py-3 text-xs font-bold backdrop-blur-xl transition hover:-translate-y-0.5 sm:px-6 sm:text-sm",
                        isDark
                          ? "border-white/15 bg-white/[0.07] text-white hover:bg-white/[0.12]"
                          : "border-black/10 bg-white/65 text-slate-900 hover:bg-white",
                      ].join(" ")}
                    >
                      {t(slide.secondaryHi, slide.secondaryEn)}
                    </Link>
                  </div>

                  {/* Feature pills */}
                  <div className="mt-8 flex flex-wrap gap-2">
                    {slide.chips.map(([hi, en, Icon]) => (
                      <div
                        key={en}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[10px] font-bold backdrop-blur-xl sm:text-xs",
                          isDark
                            ? "border-white/10 bg-black/20 text-white/70"
                            : "border-black/10 bg-white/60 text-slate-700",
                        ].join(" ")}
                      >
                        <Icon size={13} className={palette.accent} />
                        {t(hi, en)}
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT: visual composition */}
            <div className="relative hidden min-h-[500px] items-center justify-end lg:col-span-5 lg:flex">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${slide.id}-visual`}
                  initial={
                    reduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, x: 35, scale: 0.94 }
                  }
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={
                    reduceMotion
                      ? { opacity: 1 }
                      : { opacity: 0, x: -20, scale: 0.98 }
                  }
                  transition={{
                    duration: reduceMotion ? 0 : 0.65,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative w-full max-w-[470px]"
                >
                  {/* Main photo */}
                  <div
                    className={[
                      "relative overflow-hidden rounded-[34px] border p-3 shadow-2xl backdrop-blur-xl",
                      isDark
                        ? "border-white/15 bg-black/25 shadow-black/50"
                        : "border-black/10 bg-white/55 shadow-slate-900/15",
                    ].join(" ")}
                  >
                    <div className="relative h-[390px] overflow-hidden rounded-[27px]">
                      <SmartImage
                        src={slide.image}
                        alt={t(slide.titleHi, slide.titleEn)}
                        objectPosition={slide.imagePosition}
                        className="h-full w-full object-cover transition-transform duration-1000 hover:scale-105"
                        loading="lazy"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                      {/* Image top label */}
                      <div className="absolute left-4 top-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 text-[9px] font-black uppercase tracking-widest text-white/80 backdrop-blur-xl">
                          <span className={`h-1.5 w-1.5 rounded-full ${palette.line}`} />
                          {t("समाज की कहानी", "THE SAMAJ STORY")}
                        </div>
                      </div>

                      {/* Image bottom card */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="rounded-2xl border border-white/15 bg-black/35 p-4 backdrop-blur-xl">
                          <p className={`text-[9px] font-black uppercase tracking-[0.16em] ${palette.accent}`}>
                            {t(slide.visualLabelHi, slide.visualLabelEn)}
                          </p>
                          <p className="mt-1 text-sm font-bold text-white sm:text-base">
                            {t(slide.visualTextHi, slide.visualTextEn)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating ecosystem card */}
                  <motion.div
                    animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
                    transition={
                      reduceMotion
                        ? undefined
                        : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                    }
                    className={[
                      "absolute -bottom-7 -left-6 w-[220px] rounded-2xl border p-3 shadow-2xl backdrop-blur-2xl",
                      isDark
                        ? "border-white/10 bg-[#07100c]/90"
                        : "border-black/10 bg-white/90",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                        <FiUsers size={18} />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={[
                            "text-[9px] font-black uppercase tracking-widest",
                            isDark ? "text-white/40" : "text-slate-500",
                          ].join(" ")}
                        >
                          {t("डिजिटल समाज", "DIGITAL SAMAJ")}
                        </p>
                        <p
                          className={[
                            "mt-0.5 text-xs font-bold",
                            isDark ? "text-white" : "text-slate-900",
                          ].join(" ")}
                        >
                          {t("एक मंच • अनेक अवसर", "One platform • many opportunities")}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Floating module stack */}
                  <div className="absolute -right-5 top-10 w-[155px] space-y-2">
                    {[
                      [FiHeart, "Matrimonial", "/matrimonial"],
                      [FiMapPin, "Dharamshala", "/dharamshala"],
                      [FiStar, "Achievements", "/achievements"],
                    ].map(([Icon, label, href], index) => (
                      <motion.div
                        key={label}
                        initial={reduceMotion ? undefined : { opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : 0.12 * index,
                          duration: 0.35,
                        }}
                      >
                        <Link
                          to={href}
                          className={[
                            "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[10px] font-bold shadow-xl backdrop-blur-xl transition hover:-translate-x-1",
                            isDark
                              ? "border-white/10 bg-black/45 text-white/80 hover:bg-black/65"
                              : "border-black/10 bg-white/80 text-slate-800 hover:bg-white",
                          ].join(" ")}
                        >
                          <Icon size={14} className={palette.accent} />
                          {label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile visual */}
          <div className="absolute bottom-[78px] left-4 right-4 z-20 sm:left-5 sm:right-5 lg:hidden">
            <div
              className={[
                "flex items-center gap-3 rounded-2xl border p-2.5 backdrop-blur-2xl",
                isDark
                  ? "border-white/10 bg-black/35"
                  : "border-black/10 bg-white/70",
              ].join(" ")}
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                <SmartImage
                  src={slide.image}
                  alt=""
                  objectPosition={slide.imagePosition}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p
                  className={`text-[9px] font-black uppercase tracking-widest ${palette.accent}`}
                >
                  {t(slide.visualLabelHi, slide.visualLabelEn)}
                </p>
                <p
                  className={[
                    "truncate text-xs font-bold",
                    isDark ? "text-white" : "text-slate-900",
                  ].join(" ")}
                >
                  {t(slide.visualTextHi, slide.visualTextEn)}
                </p>
              </div>
              <FiArrowRight className={`ml-auto ${palette.accent}`} size={16} />
            </div>
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label={t("पिछली स्लाइड", "Previous slide")}
            className={[
              "absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-xl transition hover:scale-105 sm:left-5 sm:h-11 sm:w-11",
              isDark
                ? "border-white/15 bg-black/40 text-white"
                : "border-black/10 bg-white/70 text-slate-900",
            ].join(" ")}
          >
            <FiChevronLeft size={19} />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label={t("अगली स्लाइड", "Next slide")}
            className={[
              "absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-xl transition hover:scale-105 sm:right-5 sm:h-11 sm:w-11",
              isDark
                ? "border-white/15 bg-black/40 text-white"
                : "border-black/10 bg-white/70 text-slate-900",
            ].join(" ")}
          >
            <FiChevronRight size={19} />
          </button>

          {/* Bottom ecosystem rail */}
          <div
            className={[
              "absolute bottom-0 left-0 right-0 z-30 border-t px-4 py-3 backdrop-blur-2xl sm:px-8",
              isDark
                ? "border-white/10 bg-black/25"
                : "border-black/10 bg-white/45",
            ].join(" ")}
          >
            <div className="mx-auto flex max-w-[1450px] items-center justify-between gap-4">
              <div className="hidden items-center gap-2 lg:flex">
                <span className={`h-2 w-2 rounded-full ${palette.line} animate-pulse`} />
                <span
                  className={[
                    "text-[9px] font-black uppercase tracking-[0.18em]",
                    isDark ? "text-white/45" : "text-slate-500",
                  ].join(" ")}
                >
                  {t("समाज डिजिटल इकोसिस्टम", "SAMAJ DIGITAL ECOSYSTEM")}
                </span>
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2">
                {HERO_SLIDES.map((item, index) => {
                  const active = index === currentIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => select(index)}
                      aria-label={`${t("स्लाइड", "Slide")} ${index + 1}`}
                      className="group flex h-8 items-center px-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                    >
                      <span
                        className={[
                          "h-1.5 rounded-full transition-all duration-500",
                          active
                            ? `w-9 ${palette.line}`
                            : isDark
                              ? "w-2.5 bg-white/25 group-hover:bg-white/45"
                              : "w-2.5 bg-slate-900/20 group-hover:bg-slate-900/40",
                        ].join(" ")}
                      />
                    </button>
                  );
                })}
              </div>

              <div
                className={[
                  "hidden min-w-[55px] text-right text-[9px] font-black tracking-widest sm:block",
                  isDark ? "text-white/45" : "text-slate-500",
                ].join(" ")}
              >
                {String(currentIndex + 1).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroCarousel;
