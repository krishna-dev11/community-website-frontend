import React from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowUp,
  FiShield,
  FiUsers,
  FiBookOpen,
} from "react-icons/fi";
import { FaWhatsapp, FaFacebookF, FaYoutube } from "react-icons/fa";
import { organizationInfo } from "../../../data/bairwaData";
import { useLanguage } from "../../../i18n/LanguageContext";

const FooterLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-all duration-200 flex items-center gap-1.5 group text-xs font-medium"
    >
      <span className="w-0 h-[1.5px] bg-[var(--accent-primary)] group-hover:w-2.5 transition-all duration-200"></span>
      {children}
    </Link>
  </li>
);

const ModernFooter = () => {
  const { t, isHindi } = useLanguage();
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-[var(--surface-elevated)] text-[var(--text-primary)] pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-subtle)] transition-colors duration-300">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--border-subtle)]">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 w-fit text-decoration-none">
              <div className="h-10 w-10 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center shadow-sm">
                <span className="text-[var(--accent-primary)] font-black text-xl">ब</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-black tracking-wider uppercase text-[var(--text-primary)]">
                  {isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent-primary)]">
                  {isHindi ? "बैरवा समाज का आधिकारिक मंच" : "Official Bairwa Samaaj Platform"}
                </span>
              </div>
            </Link>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md mt-1 font-normal">
              {isHindi ? organizationInfo.missionHi : organizationInfo.missionEn}
            </p>

            {/* Social & Helpdesk Icons */}
            <div className="flex gap-2.5 mt-2">
              <a
                href="https://wa.me/919928260244"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Helpline"
                className="h-9 w-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-[var(--surface-raised)] flex items-center justify-center transition-all duration-200"
              >
                <FaWhatsapp size={15} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              {isHindi ? "संस्था एवं संगठन" : "Organization"}
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/">{isHindi ? "मुख्य पृष्ठ" : "Home"}</FooterLink>
              <FooterLink to="/about">{isHindi ? "संस्था परिचय" : "About Us"}</FooterLink>
              <FooterLink to="/management-committee">{isHindi ? "प्रदेश कार्यकारिणी" : "Executive Committee"}</FooterLink>
              <FooterLink to="/balinath">{isHindi ? "महर्षि बालीनाथ जी" : "Maharshi Balinath Ji"}</FooterLink>
              <FooterLink to="/gotras">{isHindi ? "समाज के गोत्र" : "Gotra Directory"}</FooterLink>
              <FooterLink to="/history">{isHindi ? "समाज का इतिहास" : "History & Heritage"}</FooterLink>
            </ul>
          </div>

          {/* Services & Community Welfare */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              {isHindi ? "सेवाएँ एवं कल्याण" : "Services & Seva"}
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/matrimonial">{isHindi ? "वैवाहिक परिचय मंच" : "Matrimonial Hub"}</FooterLink>
              <FooterLink to="/scholarships">{isHindi ? "छात्रवृत्ति सहायता" : "Scholarships"}</FooterLink>
              <FooterLink to="/jobs">{isHindi ? "रोजगार एवं अवसर" : "Jobs & Careers"}</FooterLink>
              <FooterLink to="/dharamshala">{isHindi ? "धर्मशाला बुकिंग" : "Dharamshala Booking"}</FooterLink>
              <FooterLink to="/publications">{isHindi ? "मासिक समाचार पत्रिका" : "Samaj Patrika"}</FooterLink>
              <FooterLink to="/donate">{isHindi ? "सहयोग एवं दान" : "Donations & Seva"}</FooterLink>
            </ul>
          </div>

          {/* Head Office Address */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              {isHindi ? "प्रधान कार्यालय" : "Head Office"}
            </h4>
            <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <p className="flex items-start gap-2">
                <FiMapPin className="text-[var(--accent-primary)] mt-0.5 shrink-0" size={14} />
                <span>{isHindi ? organizationInfo.headOffice.addressHi : organizationInfo.headOffice.addressEn}</span>
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="text-[var(--accent-primary)] shrink-0" size={13} />
                <a href="tel:+919928260244" className="hover:text-emerald-400 font-mono font-bold">
                  {organizationInfo.headOffice.phone}
                </a>
              </p>
              <p className="flex items-center gap-2">
                <FiMail className="text-[var(--accent-primary)] shrink-0" size={13} />
                <a href="mailto:contact@bairwasamaaj.com" className="hover:text-emerald-400">
                  {organizationInfo.headOffice.email}
                </a>
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-primary)] text-[#070707] font-bold text-[10px] uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
                >
                  <FiMail size={12} />
                  <span>{isHindi ? "संपर्क करें" : "Contact Us"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} {isHindi ? organizationInfo.nameHi : organizationInfo.nameEn}. {isHindi ? "सर्वाधिकार सुरक्षित।" : "All Rights Reserved."}</p>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-[var(--accent-primary)] transition-colors">
              {isHindi ? "संस्था विधान" : "About"}
            </Link>
            <Link to="/contact" className="hover:text-[var(--accent-primary)] transition-colors">
              {isHindi ? "सुझाव व सहायता" : "Helpdesk"}
            </Link>
            <button
              onClick={scrollToTop}
              aria-label="Scroll to top"
              className="flex items-center gap-1 hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
            >
              <FiArrowUp size={13} />
              <span>{isHindi ? "शीर्ष पर जाएँ" : "Top"}</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;