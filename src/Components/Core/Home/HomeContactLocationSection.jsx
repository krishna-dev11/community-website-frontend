import React from "react";
import { Link } from "react-router-dom";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiArrowRight,
  FiExternalLink,
} from "react-icons/fi";
import { FaWhatsapp, FaFacebookF } from "react-icons/fa";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeContactLocationSection = () => {
  const { isHindi } = useLanguage();

  const phone = "9926018058";
  const email = "halbahalbiujjain79@gmail.com";
  const facebookUrl = "https://www.facebook.com/halbahalbisamaj.ujjain";
  const mapUrl = "https://maps.google.com/maps?q=23.1780947%2C75.7605781&z=17&hl=en";
  const address = "श्री विट्ठल मंदिर, नरसिंह घाट रोड, कालिका माता मंदिर के पीछे, उज्जैन (म.प्र.)";

  return (
    <section className="py-12 sm:py-16">
      <div className="p-6 sm:p-10 lg:p-12 rounded-3xl border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface-elevated)] shadow-xl max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            <FiMapPin size={13} />
            <span>{isHindi ? "प्रधान कार्यालय व सचिवालय" : "Central Secretariat & Office"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "संस्था सचिवालय से संपर्क करें" : "Contact the Central Secretariat"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
            {isHindi
              ? "सदस्यता, धर्मशाला कक्ष आरक्षण, परिपत्र, छात्रवृत्ति या संस्था संबंधी किसी भी जानकारी हेतु संपर्क करें।"
              : "For membership, Dharamshala bookings, circulars, or general community queries, connect with our secretariat."}
          </p>
        </div>

        {/* Address Card */}
        <div className="mb-6 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <FiMapPin size={18} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
                {isHindi ? "कार्यालय व धर्मशाला पता" : "Office & Dharamshala Location"}
              </span>
              <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                {address}
              </p>
            </div>
          </div>

          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !py-2 !px-4 !text-xs shrink-0 inline-flex items-center gap-1.5"
          >
            <span>{isHindi ? "नक्शा देखें" : "View on Maps"}</span>
            <FiExternalLink size={13} />
          </a>
        </div>

        {/* Interactive Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Call */}
          <a
            href={`tel:+91${phone}`}
            className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <FiPhone size={18} />
            </div>
            <span className="text-xs font-black text-[var(--text-primary)]">Call</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{phone}</span>
          </a>

          {/* WhatsApp */}
          <a
            href={`https://wa.me/91${phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/10 hover:bg-[#25D366]/20 transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center mb-1.5 shadow group-hover:scale-110 transition-transform">
              <FaWhatsapp size={18} />
            </div>
            <span className="text-xs font-black text-[var(--text-primary)]">WhatsApp</span>
            <span className="text-[10px] text-[#25D366] font-bold mt-0.5">Helpline</span>
          </a>

          {/* Email */}
          <a
            href={`mailto:${email}`}
            className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
              <FiMail size={18} />
            </div>
            <span className="text-xs font-black text-[var(--text-primary)]">Email</span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate max-w-[120px]" title={email}>
              Official Mail
            </span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl border border-[#1877F2]/30 bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-all flex flex-col items-center justify-center text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center mb-1.5 shadow group-hover:scale-110 transition-transform">
              <FaFacebookF size={16} />
            </div>
            <span className="text-xs font-black text-[var(--text-primary)]">Facebook</span>
            <span className="text-[10px] text-[#1877F2] font-bold mt-0.5">Official Page</span>
          </a>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/contact"
            className="btn-primary !py-2.5 !px-6 !text-xs inline-flex items-center gap-2"
          >
            <span>{isHindi ? "सचिवालय संपर्क फॉर्म खोलें" : "Open Full Contact Page"}</span>
            <FiArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeContactLocationSection;
