import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShield, FiInfo, FiFileText, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";

const GotraDirectoryPage = () => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-28 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
          <FiShield size={13} />
          <span>{isHindi ? "कुल, गोत्र एवं वंशावली अधिकृत सूचना" : "Kinship, Clan & Gotra Notice"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi ? "हल्बा/हल्बी समाज गोत्र एवं कुल निर्देशिका" : "Halba/Halbi Kinship & Clan Traditions"}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
          {isHindi
            ? "आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन की अधिकृत कुल एवं गोत्र सत्यापन व्यवस्था।"
            : "Official Kinship and Gotra verification guidelines of Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain."}
        </p>
      </section>

      {/* Official Cautionary Advisory Box (Section 10 Compliance) */}
      <section className="py-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="ka-card p-6 sm:p-10 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-[var(--surface-elevated)] to-[var(--surface)] shadow-lg space-y-6 text-center">
          <div className="h-16 w-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mx-auto">
            <FiInfo size={30} />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 block">
              Official Samiti Advisory • Section 10
            </span>
            <h2 className="text-lg sm:text-2xl font-black text-[var(--text-primary)]">
              {isHindi ? "गोत्र एवं कुल परंपरा संबंधी अधिकृत वक्तव्य" : "Official Clan & Gotra Policy"}
            </h2>
          </div>

          {/* EXACT MANDATED CLIENT TEXT */}
          <div className="p-6 rounded-2xl border-2 border-amber-500/50 bg-[var(--surface)] shadow-inner">
            <p className="text-base sm:text-lg font-bold text-[var(--text-primary)] italic leading-relaxed">
              “{isHindi ? organizationInfo.gotraAdvisoryTextHi : organizationInfo.gotraAdvisoryText}”
            </p>
          </div>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
            {isHindi
              ? "हल्बा/हल्बी समाज विभिन्न राज्यों (मध्य प्रदेश, छत्तीसगढ़, महाराष्ट्र एवं ओडिशा) में फैला हुआ है, जहाँ विभिन्न अंचलों में क्षेत्रीय कुल देवियों, टोटेम एवं उपनामों की विविधता पाई जाती है। इंटरनेट पर उपलब्ध असत्यापित सूचियों से बचने तथा आधिकारिक प्रामाणिकता सुनिश्चित करने हेतु समिति द्वारा अपने सत्यापित अभिलेखों के आधार पर ही सूची जारी की जाएगी।"
              : "Due to regional variations across Central India, clan and kinship names vary significantly. To maintain authenticity and legal integrity, only Samiti-verified genealogical records will be published."}
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link to="/membership" className="btn-primary text-xs">
              <span>{isHindi ? "सदस्यता सत्यापन नियम देखें" : "Membership Verification"}</span>
              <FiArrowRight size={14} />
            </Link>
            <Link to="/contact" className="btn-secondary text-xs">
              <span>{isHindi ? "सचिवालय से संपर्क करें" : "Contact Secretariat"}</span>
            </Link>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default GotraDirectoryPage;
