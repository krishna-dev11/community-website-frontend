import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiBookOpen,
  FiAlertTriangle,
  FiFileText,
  FiCheckCircle,
  FiBarChart2,
  FiArrowRight,
  FiLock,
} from "react-icons/fi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";

const ConstitutionalStatusPage = () => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cs = organizationInfo.constitutionalStatus;
  const census = organizationInfo.census2011;

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
          <FiShield size={13} />
          <span>{isHindi ? "संवैधानिक स्थिति एवं शासकीय अभिलेख" : "Constitutional Status & Government Records"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi
            ? "हल्बा/हल्बी समाज: अनुसूचित जनजाति संवैधानिक दर्जा"
            : "Scheduled Tribe Constitutional Status: Halba / Halbi"}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
          {isHindi
            ? "“गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं” — भारत के संविधान (अनुसूचित जनजाति) आदेश 1950, संशोधनों, न्यायालयीन निर्णयों एवं 2011 जनगणना सांख्यिकी का प्रामाणिक विवरण।"
            : "Documented legal history under the Constitution (Scheduled Tribes) Order 1950, judicial rulings, and Census 2011 statistical records."}
        </p>
      </section>

      {/* MANDATORY LEGAL DISCLAIMER CARD */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl border-2 border-amber-500/40 bg-amber-500/10 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
            <FiAlertTriangle size={16} />
            <span>{isHindi ? "अनिवार्य विधिक स्पष्टीकरण (Mandatory Disclaimer)" : "MANDATORY LEGAL DISCLAIMER"}</span>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-relaxed">
            “{isHindi ? cs.mandatoryDisclaimerHi : cs.mandatoryDisclaimer}”
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {isHindi
              ? "वेबसाइट पर प्रकाशित जानकारी सामाजिक, सांस्कृतिक एवं ऐतिहासिक अध्ययन के उद्देश्य से है। यह किसी भी विधिक न्यायालय या प्रशासनिक प्रक्रिया में स्वतः प्रमाणीकरण का आधार नहीं है।"
              : "Information presented on this website is for socio-cultural and historical reference. It does not replace applicable government certificates or committee scrutinies."}
          </p>
        </div>
      </section>

      {/* 1. Constitutional Recognition & History */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
              <FiBookOpen size={13} />
              <span>{isHindi ? "संवैधानिक आदेश 1950 एवं संशोधन" : "Constitution ST Order 1950"}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "अनुसूचित जनजाति के रूप में कानूनी मान्यता" : "Legal History of Scheduled Tribe Entry"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi ? cs.orderTextHi : cs.orderTextEn}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "संविधान (अनुसूचित जनजाति) आदेश, 1950 के अंतर्गत मध्य प्रदेश के छिंदवाड़ा जिले में 'हल्बा' को अनुसूचित जनजाति के रूप में मान्यता दी गई थी। 1956 के संशोधन में मध्य प्रदेश की प्रविष्टि को 'Halba or Halbi' में समायोजित किया गया। राज्य पुनर्गठन के पश्चात 1976 के संशोधन द्वारा महाराष्ट्र हेतु 'Halba, Halbi' की पृथक प्रविष्टि सृजित हुई।"
                : "The tribe 'Halba' was recognized as a Scheduled Tribe in the Chhindwara district of Madhya Pradesh under the Constitution (Scheduled Tribes) Order of 1950. Subsequent amendments extended and adjusted the entry — the 1956 amendment changed the Madhya Pradesh entry to 'Halba or Halbi,' and a 1976 amendment created a separate 'Halba, Halbi' entry for Maharashtra following States Reorganisation."}
            </p>
            <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs text-[var(--text-secondary)] space-y-1.5">
              <strong className="text-[var(--text-primary)] block">
                {isHindi ? "महाराष्ट्र एवं उच्च न्यायालय का संदर्भ:" : "Maharashtra & Judicial Context:"}
              </strong>
              <p>{isHindi ? cs.maharashtraNoteHi : cs.maharashtraNoteEn}</p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
                <FiBarChart2 size={15} />
                <span>{isHindi ? "जनगणना 2011 आंकड़े (शासकीय सांख्यिकी)" : "Census 2011 Government Data"}</span>
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {isHindi ? "जनगणना 2011 के अनुसार जनसंख्या वितरण" : "Census 2011 Population Figures"}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] italic">
                {isHindi ? census.notesHi : census.notes}
              </p>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]">
                  <span>{isHindi ? "तीनों राज्यों की कुल ST जनसंख्या:" : "Three-State Combined ST:"}</span>
                  <span className="font-mono font-black text-emerald-400">6,50,631</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]">
                  <span>{isHindi ? "मध्य प्रदेश (M.P.):" : "Madhya Pradesh:"}</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">14,438</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]">
                  <span>{isHindi ? "महाराष्ट्र (Maharashtra):" : "Maharashtra:"}</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">2,61,011</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]">
                  <span>{isHindi ? "छत्तीसगढ़ (Chhattisgarh):" : "Chhattisgarh (Remainder):"}</span>
                  <span className="font-mono font-bold text-[var(--text-primary)]">~3,75,182</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]">
                  <span>{isHindi ? "हल्बी मातृभाषा भाषी (Census 2011):" : "Halbi Mother Tongue:"}</span>
                  <span className="font-mono font-bold text-sky-400">7,66,297</span>
                </div>
              </div>
            </div>

            <div className="ka-card p-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-xs space-y-2">
              <span className="font-bold text-[var(--text-primary)] block">
                {isHindi ? "समिति सदस्यता हेतु सत्यापन नियम" : "Samiti Membership Rules"}
              </span>
              <p className="text-[var(--text-secondary)]">
                {isHindi
                  ? "समिति सदस्यता हेतु 3 अनिवार्य दस्तावेज (ID प्रूफ, निवास प्रूफ, जाति प्रमाण पत्र) आवश्यक हैं।"
                  : "3 mandatory documents (ID Proof, Address Proof, Caste Proof) are required for membership verification."}
              </p>
              <Link to="/membership" className="text-emerald-400 font-bold inline-flex items-center gap-1 hover:underline">
                <span>{isHindi ? "सदस्यता नियम व आवश्यक दस्तावेज देखें" : "View Membership Rules"}</span>
                <FiArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default ConstitutionalStatusPage;
