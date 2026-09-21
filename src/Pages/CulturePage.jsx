import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiSun,
  FiMusic,
  FiCalendar,
  FiHeart,
  FiBookOpen,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiUsers,
} from "react-icons/fi";
import { GiForestCamp, GiTreeBranch, GiCampfire } from "react-icons/gi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { culturalFestivals, organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";

const CulturePage = () => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
          <FiSun size={13} />
          <span>{isHindi ? "संस्कृति, लोक परंपरा एवं प्रकृति से जुड़ाव" : "Culture, Folk Traditions & Nature"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi ? "हल्बा/हल्बी समाज की लोक संस्कृति व जीवन-दर्शन" : "Cultural Heritage, Folk Traditions & Way of Life"}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
          {isHindi
            ? "“गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं” — नवाखानी, आमा तेवर, दनकुल गायन, महुआ व वन-संस्कृति से परिपूर्ण समृद्ध सामाजिक विरासत।"
            : "A vibrant tribal culture interwoven with nature reverence, Dankul folk performances, seasonal agricultural festivals, and communal kinship."}
        </p>
      </section>

      {/* 1. Folk Music & Oral Traditions (Dankul) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
              <FiMusic size={13} />
              <span>{isHindi ? "लोक संगीत एवं मौखिक परंपरा" : "Folk Music & Oral Traditions"}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "दनकुल (Dankul) एवं परंपरागत गायन परंपरा" : "Dankul & Traditional Musical Expression"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "हल्बा सांस्कृतिक परंपरा में सामूहिक गायन, नृत्य एवं मौखिक अभिव्यक्ति की अत्यंत समृद्ध परिपाटी रही है। मानवशास्त्रीय अध्ययनों में 'दनकुल' का विशेष उल्लेख मिलता है, जो समुदाय से जुड़ा एक पारंपरिक गायन दल (singing band) है।"
                : "Traditional music, communal singing and oral expression have played an important role in transmitting community memory and social values. Anthropological studies document 'Dankul', a traditional singing band associated with the Halba community."}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "लोक प्रदर्शन एवं गीत सामाजिक आयोजनों, पारिवारिक उत्सवों एवं मांगलिक संस्कारों में सामूहिक एकता व पुरखों की स्मृतियों को जीवंत बनाए रखने का माध्यम रहे हैं।"
                : "Folk performances are closely connected with community gatherings, celebrations, and ritual life, fostering solidarity without commercial distortion."}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <GiCampfire size={20} />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {isHindi ? "मौखिक इतिहास का संवहन" : "Oral Heritage Transmission"}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isHindi
                  ? "हल्बा संस्कृति में पीढ़ी-दर-पीढ़ी गीतों, लोककथाओं और संवादों के माध्यम से समुदाय के संघर्ष, कृषि-पद्धतियों एवं सामाजिक मूल्यों का संवहन होता आया है।"
                  : "Oral traditions and folklore have preserved community memory, agricultural wisdom, and ethical values across generations."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Traditional Festivals (With Regional Variance Disclaimer) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-3">
            <FiCalendar size={13} />
            <span>{isHindi ? "पारंपरिक पर्व एवं ऋतु उत्सव" : "Festivals & Seasonal Observances"}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "नवाखानी, आमा तेवर एवं कृषि उत्सव" : "Seasonal Agricultural Celebrations"}
          </h2>
          {/* REGIONAL VARIANCE DISCLAIMER */}
          <div className="mt-3 inline-block px-4 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs text-amber-400 font-bold">
            {isHindi
              ? "“पर्व परंपराएं क्षेत्र एवं स्थानीय रीति-रिवाजों के अनुसार हल्बा समुदायों में भिन्न हो सकती हैं।”"
              : "“Festival traditions vary among Halba communities according to region and local custom.”"}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {culturalFestivals.map((fest, idx) => (
            <div key={idx} className="ka-card p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                0{idx + 1} • Seasonal Festival
              </span>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {isHindi ? fest.nameHi : fest.nameEn}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isHindi ? fest.descHi : fest.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. People, Land & Forest (Mahua & Forest Economy) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="ka-card p-6 sm:p-10 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-[var(--surface-elevated)] to-[var(--surface)] space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase">
            <GiForestCamp size={16} />
            <span>{isHindi ? "हमारी जड़ें भूमि व प्रकृति से जुड़ी हैं" : "Our Roots Are Connected to the Land"}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "भूमि, वन एवं जन-जीवन का अटूट संगम" : "People, Land & Forest"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
            {isHindi
              ? "हल्बा समुदाय के ऐतिहासिक अभिलेखों में भूमि, कृषि एवं वन संपदा (विशेष रूप से महुआ एवं तेंदू पत्ता) का आजीविका, सांस्कृतिक स्मृति एवं पारिवारिक अर्थतंत्र में निरंतर महत्वपूर्ण स्थान रहा है। वृक्षों, नदियों, ग्राम देवों एवं प्रकृति के प्रति कृतज्ञता समाज के संस्कारों का मूल आधार है।"
              : "Across historically documented Halba communities, land, agriculture and forest resources (such as mahua and tendu leaves) have played important roles in livelihood, cultural memory, household economy and community life."}
          </p>
        </div>
      </section>

      {/* 4. Marriage & Customary Traditions (With Mandatory Statutory Law Disclaimer) */}
      <section className="py-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--accent-primary)]">
              <FiUsers size={13} />
              <span>{isHindi ? "सामाजिक संबंध व विवाह परंपरा" : "Community Life & Marriage Customs"}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "पारिवारिक ताना-बाना एवं सामाजिक रीति-रिवाज" : "Family Kinship & Traditional Marriage"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "नृवंशवैज्ञानिक अध्ययनों के अनुसार, पारंपरिक हल्बा वैवाहिक संस्कारों में सगाई, हल्दी-चावल के मांगलिक अनुष्ठान, महुआ/मांडो परगनी का मंडप तथा सामूहिक नृत्य-गीत शामिल रहे हैं। ऐतिहासिक रूप से समाज के कुछ वर्गों में पुनर्विवाह की सहज सामाजिक स्वीकृति भी दर्ज मिलती है।"
                : "Documented marriage customs in researched communities include family-arranged alliances, engagement, turmeric and rice ceremonies, the 'Mahua/Mando Pargani' setting, communal music, and historically, acceptance of widow remarriage in parts of the community."}
            </p>

            {/* MANDATORY STATUTORY DISCLAIMER */}
            <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 font-semibold leading-relaxed flex items-start gap-2.5">
              <FiAlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
              <span>
                {isHindi
                  ? "“परंपरागत प्रथाएं क्षेत्र एवं कालखंड के अनुसार भिन्न हो सकती हैं और ये लागू भारतीय संविधियों/कानूनों का स्थान नहीं लेतीं।”"
                  : "“Traditional practices may differ by region and historical period and do not replace applicable Indian law.”"}
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
              <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
                {isHindi ? "परंपरागत विधि व सामाजिक व्यवस्था" : "Customary Traditions & Governance"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isHindi
                  ? "जनजातीय कार्य मंत्रालय के रिपॉजिटरी में संरक्षित 'ट्रेडिशनल लॉ ऑफ हल्बा ट्राइब' अध्ययन यह दर्शाता है कि समाज में परिवार, नातेदारी एवं विवाद समाधान की समृद्ध पारंपरिक प्रणालियां रही हैं जो वर्तमान में भारत के संवैधानिक एवं कानूनी ढांचे के साथ सामंजस्य से संचालित हैं।"
                  : "Halba social life has historically included customary practices concerning family, marriage, community responsibilities, and dispute resolution. These traditions have evolved over time and coexist today with India's formal legal and constitutional framework."}
              </p>
              <div className="pt-2">
                <Link to="/faith" className="btn-primary text-xs inline-flex items-center gap-2">
                  <span>{isHindi ? "उज्जैन समिति के आराध्य देव देखें" : "View Revered Deities"}</span>
                  <FiArrowRight size={14} />
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

export default CulturePage;
