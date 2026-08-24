import React from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowUp,
  FiExternalLink,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import {
  FaWhatsapp,
  FaFacebookF,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

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
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative bg-[var(--surface-elevated)] text-[var(--text-primary)] pt-16 pb-10 px-4 sm:px-6 lg:px-8 border-t border-[var(--border-subtle)] transition-colors duration-300">
      {/* Background Watermark */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 select-none pointer-events-none z-0 opacity-5">
        <span className="text-[8rem] md:text-[14rem] font-black uppercase tracking-widest text-[var(--text-primary)]">
          SAMAJ
        </span>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[var(--border-subtle)]">
          {/* Brand Col */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 w-fit text-decoration-none">
              <div className="h-10 w-10 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/30 flex items-center justify-center shadow-sm">
                <span className="text-[var(--accent-primary)] font-black text-xl">S</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-base font-black tracking-wider uppercase text-[var(--text-primary)]">
                  SAMAJ
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--accent-primary)]">
                  Community Portal
                </span>
              </div>
            </Link>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md mt-1 font-normal">
              Official digital ecosystem for verified Samaj members and families. Dedicated to community unity, social welfare, youth empowerment, matrimonial alliances, educational scholarships, and cultural heritage preservation.
            </p>

            {/* Social Icons */}
            <div className="flex gap-2.5 mt-2">
              {[
                { icon: FaWhatsapp, href: "https://wa.me/919876543210", label: "WhatsApp" },
                { icon: FaFacebookF, href: "#", label: "Facebook" },
                { icon: FaYoutube, href: "#", label: "YouTube" },
                { icon: FaInstagram, href: "#", label: "Instagram" },
              ].map(({ icon: Icon, href, label }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="h-9 w-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)]/40 hover:bg-[var(--surface-raised)] flex items-center justify-center transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/about">About Samaj</FooterLink>
              <FooterLink to="/dashboard/directory">Member Directory</FooterLink>
              <FooterLink to="/dashboard/family">Family Hub</FooterLink>
              <FooterLink to="/dashboard/community">Community Hub</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
            </ul>
          </div>

          {/* Core Services */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              Services & Aid
            </h4>
            <ul className="space-y-2.5">
              <FooterLink to="/matrimonial">Matrimonial Portal</FooterLink>
              <FooterLink to="/scholarships">Scholarship Aid</FooterLink>
              <FooterLink to="/jobs">Jobs & Employment</FooterLink>
              <FooterLink to="/dharamshala">Dharamshala Booking</FooterLink>
              <FooterLink to="/donate">Donations & Seva</FooterLink>
              <FooterLink to="/achievements">Member Achievements</FooterLink>
            </ul>
          </div>

          {/* Contact & Address */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
              Samaj Bhawan
            </h4>
            <div className="space-y-2.5 text-xs text-[var(--text-secondary)]">
              <p className="flex items-start gap-2">
                <FiMapPin className="text-[var(--accent-primary)] mt-0.5 shrink-0" size={14} />
                <span>Samaj Bhawan, Community Center Road, Sector 5, New Delhi - 110001</span>
              </p>
              <p className="flex items-center gap-2">
                <FiPhone className="text-[var(--accent-primary)] shrink-0" size={13} />
                <span>+91 98765 43210 / +91 11 2345 6789</span>
              </p>
              <p className="flex items-center gap-2">
                <FiMail className="text-[var(--accent-primary)] shrink-0" size={13} />
                <span>helpdesk@samajportal.org</span>
              </p>
              <div className="pt-2">
                <Link
                  to="/donate"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-primary)] text-[#070707] font-bold text-[10px] uppercase tracking-wider shadow-sm hover:opacity-90 transition-opacity"
                >
                  <FiHeart size={11} /> Support Samaj
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>
            © {new Date().getFullYear()} Samaj Community Portal. All rights reserved. Registered Indian Social & Charitable Trust.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-[var(--text-primary)] transition-colors">
              Trustee Board
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-[var(--text-primary)] transition-colors">
              Helpdesk
            </Link>
            <span>•</span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 hover:text-[var(--accent-primary)] transition-colors cursor-pointer"
            >
              Back to top <FiArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;