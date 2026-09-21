import React from "react";
import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiCheckCircle,
  FiShield,
  FiArrowRight,
  FiHome,
  FiClock,
  FiUsers,
  FiExternalLink,
} from "react-icons/fi";
import { GiTempleDoor } from "react-icons/gi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeDharamshalaSection = () => {
  const { isHindi } = useLanguage();

  return (
    <section className="py-10 sm:py-14">
      {/* Section Header with Classical Ornamental Divider */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
          <GiTempleDoor size={13} />
          <span>{isHindi ? "उज्जैन तीर्थ यात्री निवास" : "Ujjain Pilgrim Sanctuary"}</span>
          <span>❖</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[var(--text-primary)]">
          {isHindi ? "हलबा समाज धर्मशाला, उज्जैन" : "Halba Samaj Dharamshala"}
        </h2>
        <div className="flex items-center justify-center gap-3 mt-3 text-amber-500/60">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-500" />
          <span className="text-xs">♦ ❖ ♦</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-500" />
        </div>
      </div>

      <div className="p-5 sm:p-8 lg:p-10 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-[var(--surface-raised)] to-[var(--surface-elevated)] shadow-xl relative overflow-hidden">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left: Dharamshala Campus Photograph */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 bg-black shadow-lg group">
              <img
                src="/images/dharamshala.jpg"
                alt="Halba Samaj Dharamshala Ujjain"
                className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Floating Status & Address Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-amber-400/40 text-[10px] font-black text-amber-300 flex items-center gap-1.5">
                <FiHome size={12} />
                <span>श्री विट्ठल मंदिर परिसर</span>
              </div>

              <div className="absolute bottom-3 inset-x-3 text-white text-left">
                <p className="text-xs font-bold text-amber-200 flex items-start gap-1">
                  <FiMapPin className="shrink-0 mt-0.5" size={13} />
                  <span>नरसिंह घाट रोड, कालिका माता मंदिर के पीछे, उज्जैन</span>
                </p>
                <span className="text-[10px] text-white/80 block mt-0.5">
                  पवित्र क्षिप्रा तट एवं महाकाल मंदिर के निकट
                </span>
              </div>
            </div>
          </div>

          {/* Right: Verified Facilities & Tariffs */}
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal">
              {isHindi
                ? "उज्जैन महाकाल एवं पवित्र क्षिप्रा दर्शन हेतु पधारने वाले समाज बंधुओं व दर्शनार्थियों के लिए सुलभ, स्वच्छ एवं पवित्र आवास व्यवस्था। कुल 05 डबल कमरे (अधिकतम क्षमता 4 व्यक्ति प्रति कमरा) एवं 01 विशाल सामुदायिक हॉल उपलब्ध है। एक समान मानक दरें सभी अतिथियों के लिए लागू हैं।"
                : "Clean, peaceful accommodation for pilgrims and community members visiting holy Ujjain. Features 5 double rooms (max 4 persons per room) and 1 spacious community hall with standard pricing for all guests."}
            </p>

            {/* Room Tariff Cards with Classic Highlight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl border-2 border-emerald-500/30 bg-[var(--surface)] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {isHindi ? "AC डबल रूम (02 कमरे)" : "AC Double Rooms (02)"}
                  </span>
                </div>
                <p className="text-base font-black text-[var(--text-primary)] mt-1">
                  ₹1,200 / दिन
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {isHindi ? "अटैच्ड टॉयलेट युक्त • अधिकतम 4 व्यक्ति" : "Attached Toilet • Max 4 Persons"}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border-2 border-amber-500/30 bg-[var(--surface)] shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    {isHindi ? "Non-AC डबल रूम (03 कमरे)" : "Non-AC Double Rooms (03)"}
                  </span>
                </div>
                <p className="text-base font-black text-[var(--text-primary)] mt-1">
                  ₹800 / दिन
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {isHindi ? "नॉन-अटैच्ड टॉयलेट • अधिकतम 4 व्यक्ति" : "Non-Attached Toilet • Max 4 Persons"}
                </p>
              </div>
            </div>

            {/* Guidelines Strip */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-500 shrink-0" size={13} />
                <span>मूल पहचान पत्र (Original ID) अनिवार्य</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiClock className="text-amber-500 shrink-0" size={13} />
                <span>चेक-इन: 12:00 AM • चेक-आउट: 10:00 AM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-500 shrink-0" size={13} />
                <span>24 घंटे पूर्व रद्दीकरण पर 50% रिफंड</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FiShield className="text-rose-500 shrink-0" size={13} />
                <span>धूम्रपान, मद्यपान व मांसाहार पूर्णतः निषेध</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/dharamshala" className="btn-primary !py-2.5 !px-5 !text-xs">
                <span>{isHindi ? "धर्मशाला विवरण व बुकिंग" : "Dharamshala Details & Booking"}</span>
                <FiArrowRight size={14} />
              </Link>
              <Link to="/contact" className="btn-secondary !py-2.5 !px-5 !text-xs">
                <span>{isHindi ? "स्थान एवं मार्ग निर्देश" : "Location & Route"}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeDharamshalaSection;
