import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { translations } from "./translations";

const LANGUAGE_KEY = "samaj_language_pref";

const LanguageContext = createContext({
  language: "hi",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key, fallback = "") => fallback,
  isHindi: true,
});

export const LanguageProvider = ({ children }) => {
  const getInitialLanguage = () => {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);
      if (saved === "hi" || saved === "en") return saved;
    } catch {
      // ignore local storage errors
    }
    // Default to Hindi for all first-time visitors as explicitly requested
    return "hi";
  };

  const [language, setLanguageState] = useState(getInitialLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
      document.documentElement.setAttribute("lang", language);
    } catch {}
  }, [language]);

  const setLanguage = useCallback((lang) => {
    if (lang === "hi" || lang === "en") {
      setLanguageState(lang);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "hi" ? "en" : "hi"));
  }, []);

  const t = useCallback(
    (key, fallback = "") => {
      if (!key) return fallback;
      const dict = translations[language] || translations.hi;
      if (dict && dict[key] !== undefined) {
        return dict[key];
      }
      // Fallback to English dictionary or provided fallback
      const enDict = translations.en;
      if (enDict && enDict[key] !== undefined) {
        return enDict[key];
      }
      return fallback || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        lang: language,
        setLanguage,
        toggleLanguage,
        toggleLang: toggleLanguage,
        t,
        isHindi: language === "hi",
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
