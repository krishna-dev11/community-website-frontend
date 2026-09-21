import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiBriefcase,
  FiTrendingUp,
  FiCheckCircle,
  FiBookOpen,
  FiAward,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";
import { GiSprout, GiAncientSword, GiSewingNeedle, GiForestCamp } from "react-icons/gi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { livelihoodsData } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";

const LivelihoodsPage = () => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-bold text-sky-400 mb-4">
          <FiBriefcase size={13} />
          <span>{isHindi ? "पारंपरिक आजीविका से आधुनिक प्रगति" : "Traditional Livelihoods to Modern Horizons"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi ? "पारंपरिक आजीविका, बुनकर इतिहास एवं आधुनिक समाज" : "Traditional Livelihoods & Modern Halba/Halbi"}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
          {isHindi
            ? "“विरासत से नई पीढ़ियों तक” — कृषि, सैन्य सेवा, वनोपज एवं व्यावसायिक विविधता से लेकर आधुनिक शिक्षा, प्रशासन एवं उद्यमशीलता तक समाज की गौरवशाली विकास यात्रा।"
            : "From agriculture, military service and forest economy to modern education, public administration, and entrepreneurship."}
        </p>
      </section>

      {/* 1. Traditional Occupations Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "ऐतिहासिक आजीविका के प्रमुख आयाम" : "Historical Livelihoods & Occupations"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "दस्तावेजी स्रोतों एवं नृवंशविज्ञान के अनुसार हल्बा समुदाय की पारंपरिक आजीविकाएं:"
              : "Historically documented occupations and economic roles across studied regions:"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <GiSprout size={20} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              {isHindi ? "कृषि एवं भू-स्वामित्व" : "Agriculture & Farming"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "हल संस्कृति से जुड़ाव; पारंपरिक रूप से खेती, कृषि-श्रम एवं कई अंचलों में भू-स्वामित्व समाज का मुख्य आर्थिक आधार रहा है।"
                : "Deep connection with cultivation ('Hal'); settled farming and landholding historically formed the bedrock of economic life."}
            </p>
          </div>

          <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <GiAncientSword size={20} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              {isHindi ? "सैन्य एवं सुरक्षा सेवा" : "Military & Guard Services"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "बस्तर एवं आसपास के क्षेत्रीय शासकों के अधीन रक्षक, किलेदार एवं सैन्य दस्तों के रूप में अनुशासित सेवा परंपरा।"
                : "Historical accounts record disciplined military service and guard roles under regional ruling dynasties."}
            </p>
          </div>

          <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <GiSewingNeedle size={20} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              {isHindi ? "वस्त्र बुनाई परंपरा" : "Weaving Traditions"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "महाराष्ट्र के कुछ भागों (भंडारा/बरार) में समाज के कुछ वर्गों द्वारा बुनाई का व्यवसाय अपनाया गया।"
                : "Historical records show sections of the Halba community adopted weaving as an occupation in parts of Maharashtra."}
            </p>
          </div>

          <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <GiForestCamp size={20} />
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              {isHindi ? "वनोपज आधारित अर्थव्यवस्था" : "Forest Produce Economy"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "महुआ संकलन, तेंदू पत्ता एवं लघु वनोपज का घरेलू आय एवं मौसमी आजीविका में सदियों से निरंतर योगदान।"
                : "Mahua, tendu leaves, and seasonal forest produce historically supported household economies."}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Weaving and Halba-Koshti History Section (Handle With Caution) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="ka-card p-6 sm:p-8 rounded-3xl border border-sky-500/30 bg-[var(--surface-elevated)] space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase">
            <FiInfo size={15} />
            <span>{isHindi ? "सामाजिक एवं व्यावसायिक इतिहास का दस्तावेजी विश्लेषण" : "Documented Social & Occupational History"}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)]">
            {isHindi ? "बुनाई एवं हल्बा-कोष्टी ऐतिहासिक संबंध" : "Weaving and the Halba-Koshti Historical Association"}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
            {isHindi ? livelihoodsData.weavingNoteHi : livelihoodsData.weavingNoteEn}
          </p>

          <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-xs text-[var(--text-muted)] leading-relaxed">
            <strong className="text-[var(--text-primary)]">
              {isHindi ? "वेबसाइट मार्गदर्शन: " : "Cautionary Note: "}
            </strong>
            {isHindi
              ? "समय के साथ ऐतिहासिक अभिलेखों में व्यावसायिक नामों और सामुदायिक पहचान का उल्लेख एक साथ मिलता है। इस विवरण का उद्देश्य केवल सामाजिक-व्यावसायिक इतिहास को समझना है, किसी व्यक्ति के जाति/जनजाति दर्जे पर कानूनी निष्कर्ष निकालना नहीं।"
              : "Historical records show that sections of the Halba community adopted weaving as an important occupation in parts of Maharashtra. Over time, occupational labels and community identity sometimes appeared together in historical records. This section presents documented social/occupational history and is not a legal conclusion about any individual's caste or tribe status."}
          </div>
        </div>
      </section>

      {/* 3. Modern Halba/Halbi — From Heritage to New Generations */}
      <section className="py-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <FiTrendingUp size={13} />
              <span>{isHindi ? "विरासत से नई पीढ़ियों तक" : "From Heritage to New Generations"}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "आधुनिक भारत में शिक्षा, रोजगार एवं उद्यमशीलता" : "Modern Diversification & Social Progress"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "समकालीन हल्बा/हल्बी समाज अपनी समृद्ध ऐतिहासिक जड़ों को सहेजते हुए आधुनिक शिक्षा, शासकीय एवं निजी सेवाओं, न्यायपालिका, चिकित्सा, तकनीकी विशेषज्ञता, व्यापार एवं उद्यमशीलता में उल्लेखनीय उपलब्धियां हासिल कर रहा है।"
                : "The contemporary Halba community combines historical traditions with education, modern employment, entrepreneurship, public service, and new forms of digital community organization."}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन समाज के युवाओं के लिए करियर मार्गदर्शन, छात्रवृत्ति समन्वय एवं प्रतिभा प्रोत्साहन हेतु सतत प्रतिबद्ध है।"
                : "Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain actively supports student scholarships, youth career guidance, and community unity."}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
              <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
                {isHindi ? "समिति के 6 मुख्य स्तंभ" : "Six Pillars of Sanstha"}
              </h3>
              <ul className="space-y-2 text-xs text-[var(--text-secondary)]">
                <li className="flex items-center gap-2">
                  <FiCheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>{isHindi ? "शिक्षा (Education) — छात्र सहायता व मार्गदर्शन" : "Education — Student aid & mentorship"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>{isHindi ? "स्वास्थ्य (Healthcare) — स्वास्थ्य सहयोग व जागरूकता" : "Healthcare — Medical aid & awareness"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>{isHindi ? "आर्थिक सहयोग (Economic Support) — संबल" : "Economic Support — Need-based community aid"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>{isHindi ? "शासकीय सहायता (Govt. Support) — अधिकार चेतना" : "Government Support — Schemes coordination"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>{isHindi ? "संस्कृति (Culture) — धरोहर का संरक्षण" : "Culture — Preserving traditions"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <FiCheckCircle size={13} className="text-emerald-400 shrink-0" />
                  <span>{isHindi ? "सामाजिक एकता (Unity) — भाईचारा व मेल-मिलाप" : "Community Unity — Brotherhood & programs"}</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link to="/about" className="btn-secondary text-xs inline-flex items-center gap-2">
                  <span>{isHindi ? "संस्था का पूर्ण परिचय देखें" : "View About Sanstha"}</span>
                  <FiArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default LivelihoodsPage;
