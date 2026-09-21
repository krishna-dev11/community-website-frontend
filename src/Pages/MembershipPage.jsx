import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiArrowRight,
  FiClock,
  FiUsers,
} from "react-icons/fi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";

const MembershipPage = () => {
  const { isHindi } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const mem = organizationInfo.membership;
  const don = organizationInfo.donations;

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 mb-4">
          <FiShield size={13} />
          <span>{isHindi ? "सदस्यता नियम एवं सत्यापन प्रक्रिया" : "Membership Rules & Verification"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi ? "समिति सदस्यता: नियम एवं अनिवार्य दस्तावेज" : "Samiti Membership: Guidelines & Documents"}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
          {isHindi
            ? "“गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं” — आदिवासी हल्बा/हल्बी समाज कल्याण समिति, उज्जैन से जुड़ने हेतु 3 अनिवार्य दस्तावेजों की आवश्यकता एवं अंशदान नियम।"
            : "Official membership verification requirements and contribution rules for Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain."}
        </p>
      </section>

      {/* 1. Mandatory 3 Documents Grid (Section 14) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            Section 14 • Official Verification
          </span>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "अनिवार्य 3 दस्तावेज (Mandatory Documents)" : "3 Mandatory Documents Required"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "सदस्यता सत्यापन हेतु आवेदक द्वारा निम्नलिखित तीनों प्रमाण पत्र प्रस्तुत करना अनिवार्य है:"
              : "For official membership verification, applicant must submit all three required proofs:"}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {(isHindi ? mem.mandatoryDocsHi : mem.mandatoryDocsEn).map((doc) => (
            <div key={doc.id} className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                0{doc.id}
              </div>
              <h3 className="font-bold text-sm text-[var(--text-primary)]">
                {doc.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {doc.desc}
              </p>
              {doc.id === 3 && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                  {isHindi
                    ? "जाति प्रमाण के विकल्प: आधार कार्ड, हल्बा जाति प्रमाण-पत्र, SLC, जिला समिति द्वारा जारी प्रमाण पत्र, अथवा स्टांप पेपर पर स्व-घोषणा।"
                    : "Accepted Caste Proofs: Aadhaar Card, Halba Caste Certificate, SLC, District Samiti certificate, or Stamp paper self-declaration."}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Donation & Contribution Rules (Section 15) */}
      <section className="py-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Section 15 • Contribution & Seva Fund
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "मासिक अंशदान एवं सहयोग नियम" : "Contribution Rules & Community Fund"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "समिति के सुचारू संचालन, सामाजिक प्रकल्पों एवं धर्मशाला व्यवस्था हेतु सदस्यों द्वारा मासिक अंशदान एवं ऐच्छिक दान का प्रावधान है:"
                : "For smooth organization management, social assistance, and Dharamshala upkeep, member contributions are structured as follows:"}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-emerald-400 block">मासिक अंशदान</span>
                <p className="font-bold text-sm text-[var(--text-primary)]">{don.monthlyContribution}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{don.monthlyContributionPeriod}</p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-amber-400 block">विलंब शुल्क (Late Fine)</span>
                <p className="font-bold text-sm text-[var(--text-primary)]">{don.lateFine}</p>
                <p className="text-[11px] text-[var(--text-muted)]">10 तारीख के पश्चात लागू</p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-sky-400 block">ऐच्छिक दान (Donation)</span>
                <p className="font-bold text-sm text-[var(--text-primary)]">{don.voluntaryDonation}</p>
                <p className="text-[11px] text-[var(--text-muted)]">समाज कल्याण हेतु स्वेच्छा से</p>
              </div>

              <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-1">
                <span className="text-[10px] font-bold uppercase text-purple-400 block">सामयिक सहयोग</span>
                <p className="font-bold text-sm text-[var(--text-primary)]">समिति द्वारा निर्धारित</p>
                <p className="text-[11px] text-[var(--text-muted)]">विशिष्ट आयोजनों हेतु</p>
              </div>
            </div>

            {/* PAYMENT DETAILS NOTICE (Section 15 client instruction: no fake UPI/QR) */}
            <div className="p-4 rounded-2xl border border-sky-500/30 bg-sky-500/10 text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)] block mb-1">
                {isHindi ? "ऑनलाइन भुगतान विवरण सूचना:" : "Online Payment Credentials Notice:"}
              </strong>
              {isHindi ? don.paymentNoteHi : don.paymentNote}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="ka-card p-6 rounded-3xl border border-emerald-500/30 bg-[var(--surface-elevated)] space-y-4 text-center">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <FiUsers size={22} />
              </div>
              <h3 className="font-black text-base text-[var(--text-primary)]">
                {isHindi ? "सदस्य बनें या पंजीयन करें" : "Join or Register Now"}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isHindi
                  ? "यदि आप हल्बा/हल्बी समाज के सदस्य हैं, तो समिति पोर्टल पर अपना प्रोफाइल बनाएं और समाज के विकास में सहभागी बनें।"
                  : "Create your profile on the community portal to connect with verified members and participate in social programs."}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Link to="/signup" className="btn-primary text-xs w-full py-2.5">
                  <span>{isHindi ? "ऑनलाइन पंजीयन फॉर्म भरें" : "Fill Registration Form"}</span>
                </Link>
                <Link to="/contact" className="btn-secondary text-xs w-full py-2.5">
                  <span>{isHindi ? "कार्यालय से संपर्क करें" : "Contact Head Office"}</span>
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

export default MembershipPage;
