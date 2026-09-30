import React from "react";
import { Link } from "react-router-dom";
import { FiBell, FiPhoneCall } from "react-icons/fi";
import { useLanguage } from "../../../i18n/LanguageContext";

const HomeLiveTicker = () => {
  const { isHindi } = useLanguage();

  const updates = [
    {
      textHi:
        "आदिवासी हलबा/हलबी समाज कल्याण समिति, उज्जैन के आधिकारिक पोर्टल पर आपका स्वागत है।",
      textEn:
        "Welcome to the official community portal of Adivasi Halba/Halbi Samaj Kalyan Samiti, Ujjain.",
      to: "/",
    },

    {
      textHi:
        "समाज धर्मशाला में उज्जैन आने वाले समाज बंधुओं के लिए कमरे एवं हॉल आरक्षण की सुविधा उपलब्ध है। महाकाल दर्शन के अलावा अन्य आवश्यक कार्यों हेतु आने पर भी ठहरने की सुविधा उपलब्ध है।",
      textEn:
        "Room and hall booking is available at Samaj Dharamshala for members visiting Ujjain. Accommodation is available for genuine purposes beyond Mahakal Darshan as well.",
      to: "/dharamshala",
    },

    {
      textHi:
        "समाज की सदस्यता एवं सदस्यता प्रमाण-पत्र के लिए ऑनलाइन पंजीकरण सुविधा उपलब्ध है।",
      textEn:
        "Online registration is available for Samaj Membership and the official Membership Certificate.",
      to: "/membership",
    },

    {
      textHi:
        "समाज के सदस्य अपने परिवार, सदस्यता, योगदान एवं अन्य सामुदायिक सेवाओं की जानकारी ऑनलाइन पोर्टल के माध्यम से देख सकते हैं।",
      textEn:
        "Members can access their family, membership, contributions and other community services through the online portal.",
      to: "/dashboard",
    },

    {
      textHi:
        "नौकरी एवं छात्रवृत्ति के अवसर समाज के सदस्यों के लिए ऑनलाइन उपलब्ध हैं। पात्र सदस्य नौकरी की जानकारी साझा कर सकते हैं और छात्रवृत्ति के लिए आवेदन कर सकते हैं।",
      textEn:
        "Job and scholarship opportunities are available online for Samaj members.",
      to: "/opportunities",
    },

    {
      textHi:
        "समाज धर्मशाला में कमरों एवं हॉल की उपलब्धता के अनुसार ऑनलाइन बुकिंग अनुरोध भेजा जा सकता है।",
      textEn:
        "Online booking requests can be submitted for rooms and the community hall, subject to availability.",
      to: "/dharamshala",
    },

    {
      textHi:
        "समाज से संबंधित कार्यक्रम, सूचनाएं, उपलब्धियां, पत्रिका एवं गैलरी की जानकारी अब एक ही डिजिटल पोर्टल पर उपलब्ध है।",
      textEn:
        "Community events, notices, achievements, publications and gallery updates are available on one digital portal.",
      to: "/",
    },

    {
      textHi:
        "सहायता एवं संपर्क के लिए समाज सचिवालय हेल्पलाइन: +91 99260 18058।",
      textEn:
        "For assistance and enquiries, contact the Samaj Secretariat Helpline: +91 99260 18058.",
      to: "/contact",
    },
  ];

  return (
    <div className="w-full bg-[#fbfaf6] dark:bg-[#101b15] text-stone-700 dark:text-stone-300 py-1.5 px-3 sm:px-4 rounded-xl border border-stone-200/80 dark:border-stone-800 shadow-2xs flex items-center gap-2.5 overflow-hidden text-xs">

      {/* Ticker Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#14532d] text-white font-bold tracking-wide uppercase text-[10px] shrink-0">
        <FiBell size={11} />

        <span>
          {isHindi ? "सूचना" : "Notice"}
        </span>
      </div>

      {/* Marquee Content */}
      <div className="flex-1 overflow-hidden relative whitespace-nowrap">
        <div className="inline-flex items-center gap-8 animate-marquee">

          {updates.concat(updates).map((upd, i) => (
            <span
              key={`${upd.to}-${i}`}
              className="inline-flex items-center gap-2 font-medium text-[11px] sm:text-xs"
            >
              {/* Separator */}
              <span className="text-amber-600 dark:text-amber-400 font-bold">
                ❖
              </span>

              {/* Clickable Update */}
              <Link
                to={upd.to}
                className="
                  hover:text-[#14532d]
                  dark:hover:text-emerald-400
                  transition-colors
                  cursor-pointer
                "
              >
                {isHindi ? upd.textHi : upd.textEn}
              </Link>
            </span>
          ))}

        </div>
      </div>

      {/* Quick Helpline CTA */}
      <a
        href="tel:+919926018058"
        className="
          hidden md:inline-flex
          items-center gap-1.5
          px-2.5 py-0.5
          rounded-md
          bg-stone-100 hover:bg-stone-200
          dark:bg-stone-800 dark:hover:bg-stone-700
          text-stone-700 dark:text-stone-300
          text-[11px] font-medium
          shrink-0
          transition-colors
          border border-stone-200 dark:border-stone-700
        "
      >
        <FiPhoneCall
          size={11}
          className="text-amber-600 dark:text-amber-400"
        />

        <span>9926018058</span>
      </a>
    </div>
  );
};

export default HomeLiveTicker;