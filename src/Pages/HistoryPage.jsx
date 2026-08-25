import React, { useEffect, useState } from "react";
import { FiBookOpen, FiClock, FiShield, FiHeart, FiAward, FiCheckCircle } from "react-icons/fi";
import { organizationInfo, balinathData } from "../data/bairwaData";
import { useLanguage } from "../i18n/LanguageContext";
import ModernFooter from "../Components/Core/Home/ModernFooter";

const HistoryPage = () => {
  const { isHindi } = useLanguage();
  const [activeSection, setActiveSection] = useState("01");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: "01",
      titleHi: "01. परिचय एवं सामाजिक पहचान",
      titleEn: "01. Introduction & Social Identity",
      contentHi:
        "बैरवा समाज भारत का एक प्राचीन, स्वाभिमानी, श्रमशील एवं गौरवशाली समाज है। समाज की अधिकांश आबादी राजस्थान, मध्य प्रदेश, दिल्ली, उत्तर प्रदेश, हरियाणा एवं गुजरात में निवास करती है। प्रांतीय बैरवा प्रगति संस्था (पंजीकृत कार्यालय: सी-57, महेश नगर, जयपुर) समाज के सर्वांगीण उत्थान, शैक्षणिक प्रगति एवं सांस्कृतिक संरक्षण हेतु निरंतर कार्यरत है।",
      contentEn:
        "Bairwa Samaaj is an ancient, self-respecting, industrious, and proud community of India. The primary population resides in Rajasthan, Madhya Pradesh, Delhi, Uttar Pradesh, Haryana, and Gujarat. Prantiya Bairwa Pragati Sanstha (C-57, Mahesh Nagar, Jaipur) actively leads the community's educational, social, and cultural advancement.",
    },
    {
      id: "02",
      titleHi: "02. ऐतिहासिक पृष्ठभूमि व मान्यताएँ",
      titleEn: "02. Historical Background & Heritage",
      contentHi:
        "उपलब्ध सामाजिक स्रोतों एवं मान्यताओं के अनुसार, बैरवा समाज का इतिहास अत्यंत समृद्ध रहा है। समाज ने समय-समय पर कृषि, शिल्प, समाज सुधार और राष्ट्र निर्माण में महत्वपूर्ण भूमिका निभाई है। समाज का मूल स्वभाव शांतिप्रिय, धर्मपरायण, अतिथि सत्कार करने वाला तथा स्वाभिमानी रहा है।",
      contentEn:
        "According to community historical records and traditions, Bairwa Samaaj possesses a rich heritage. The community has made foundational contributions to agriculture, craftsmanship, social reform, and nation-building with an innate ethos of self-respect and hospitality.",
    },
    {
      id: "03",
      titleHi: "03. महर्षि बालीनाथ जी महाराज का प्रभाव",
      titleEn: "03. Legacy of Maharshi Balinath Ji",
      contentHi:
        "परम पूज्य महर्षि बालीनाथ जी महाराज (जन्म: मण्डावरी, लालसोट, दौसा) बैरवा समाज के सर्वोच्च पूज्य संत एवं पथ-प्रदर्शक हैं। आपने समाज को कुरीतियों, बाल विवाह और अंधविश्वास से मुक्त कर शिक्षा, नशा मुक्ति, सदाचार और स्वावलंबन का पावन संदेश दिया। मण्डावरी धाम में स्थित आपकी समाधि समाज का परम पावन तीर्थ स्थल है।",
      contentEn:
        "Param Pujya Maharshi Balinath Ji Maharaj (Born in Mandawari, Lalsot, Dausa) is the revered spiritual guide and social reformer of Bairwa Samaaj. He guided the community away from superstition, child marriage, and intoxicants toward mass education, virtue, and self-reliance. Mandawari Dham is the sacred pilgrimage center of the community.",
    },
    {
      id: "04",
      titleHi: "04. बाबा साहेब और सामाजिक चेतना",
      titleEn: "04. Dr. Ambedkar & Social Consciousness",
      contentHi:
        "बोधिसत्व भारत रत्न डॉ. बी. आर. अम्बेडकर का बैरवा समाज पर गहरा और अमिट प्रभाव है। बाबा साहेब के 'शिक्षित बनो, संगठित रहो, संघर्ष करो' के मूल मंत्र को समाज ने अपने जीवन में आत्मसात किया है। समाज में शिक्षा, समरसता, आत्मसम्मान और संविधानिक अधिकारों के प्रति चेतना निरंतर सशक्त हुई है।",
      contentEn:
        "Bharat Ratna Dr. B. R. Ambedkar's ideals of social justice, constitutional equality, and human dignity have deeply guided Bairwa Samaaj. Embracing his call to 'Educate, Agitate, Organize', community members have achieved outstanding progress in higher education, administration, and public service.",
    },
    {
      id: "05",
      titleHi: "05. शिक्षा, रोजगार और आर्थिक प्रगति",
      titleEn: "05. Education, Employment & Progress",
      contentHi:
        "विगत दशकों में बैरवा समाज के युवाओं ने सिविल सेवाओं, उच्च प्रशासनिक पदों, न्यायपालिका, चिकित्सा, अभियांत्रिकी, तकनीकी और व्यापार में उल्लेखनीय सफलताएँ अर्जित की हैं। समाज की बेटियों ने भी उच्च शिक्षा में उत्कृष्ट स्थान बनाकर समाज का नाम रोशन किया है।",
      contentEn:
        "In recent decades, Bairwa youth have excelled in civil services, state administration, judiciary, medicine, engineering, technology, and entrepreneurship. Daughters of the community have earned academic distinctions and leadership roles.",
    },
    {
      id: "06",
      titleHi: "06. विवाह एवं सामाजिक परंपराएँ",
      titleEn: "06. Matrimonial & Social Customs",
      contentHi:
        "समाज में विवाह संस्कार को पवित्र माना जाता है। प्रांतीय बैरवा प्रगति संस्था द्वारा प्रतिवर्ष युवक-युवती परिचय सम्मेलन एवं सामूहिक विवाह सम्मेलनों का सफल आयोजन किया जाता है, जिससे फिजूलखर्ची पर रोक लगी है और सैकड़ों परिवारों को योग्य जीवनसाथी प्राप्त हुए हैं।",
      contentEn:
        "Matrimony is regarded as a sacred union. Prantiya Bairwa Pragati Sanstha annually conducts large-scale youth introduction meets and mass marriage conferences to eliminate unnecessary expenditure and facilitate compatible alliances.",
    },
    {
      id: "07",
      titleHi: "07. सामाजिक सुधार एवं भविष्य की दिशा",
      titleEn: "07. Social Reforms & Future Horizons",
      contentHi:
        "संस्था का संकल्प है कि समाज में शत-प्रतिशत साक्षरता हो, कुरीतियों और दहेज प्रथा का पूर्ण उन्मूलन हो, पर्यावरण संरक्षण व पौधारोपण को बढ़ावा मिले, और युवा पीढ़ी को प्रतियोगी परीक्षाओं व स्वरोजगार के सर्वोत्तम अवसर उपलब्ध हों।",
      contentEn:
        "The organization is resolute in achieving 100% literacy, eradicating dowry and superstition, promoting environmental conservation, and providing scholarship mentorship to every aspiring student.",
    },
  ];

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300">
      {/* Hero */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
          <FiBookOpen size={13} />
          <span>{isHindi ? "सामाजिक इतिहास एवं सांस्कृतिक विरासत" : "Social History & Cultural Heritage"}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi ? "बैरवा समाज का इतिहास व परंपरा" : "History & Heritage of Bairwa Samaaj"}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto">
          {isHindi
            ? "प्रांतीय बैरवा प्रगति संस्था, जयपुर द्वारा समाज के गौरवशाली इतिहास, संत परंपरा, सामाजिक उपलब्धियों एवं सुधार आंदोलनों का प्रामाणिक संकलन।"
            : "An authentic compilation of the glorious history, spiritual traditions, achievements, and social reform movements of Bairwa Samaaj."}
        </p>
      </section>

      {/* Main Content Layout */}
      <section className="py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Navigation on Desktop */}
          <aside className="lg:col-span-4 sticky top-24 hidden lg:block ka-card p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3 px-2">
              {isHindi ? "अध्याय सूची" : "Chapters"}
            </p>
            {sections.map((sec) => (
              <a
                key={sec.id}
                href={`#sec-${sec.id}`}
                onClick={() => setActiveSection(sec.id)}
                className={`block rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  activeSection === sec.id
                    ? "bg-[var(--accent-primary)] text-black font-bold"
                    : "text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-white"
                }`}
              >
                {isHindi ? sec.titleHi : sec.titleEn}
              </a>
            ))}
          </aside>

          {/* Long-Form Chapters */}
          <main className="lg:col-span-8 space-y-8">
            {sections.map((sec) => (
              <article
                key={sec.id}
                id={`sec-${sec.id}`}
                className="ka-card p-6 sm:p-8 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] scroll-mt-24"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
                  <FiClock size={12} />
                  <span>{isHindi ? "अध्याय" : "Chapter"} {sec.id}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-[var(--text-primary)] mb-4 leading-snug">
                  {isHindi ? sec.titleHi : sec.titleEn}
                </h2>
                
                {sec.id === "03" && (
                  <div className="mb-6 flex justify-center sm:justify-start">
                    <div className="w-48 sm:w-56 aspect-[9/16] rounded-2xl overflow-hidden border border-amber-500/30 bg-black shadow-lg">
                      <img
                        src="/balinathjimaharaj.jpg"
                        alt="महर्षि बालीनाथ जी महाराज"
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed font-normal whitespace-pre-line">
                  {isHindi ? sec.contentHi : sec.contentEn}
                </p>
              </article>
            ))}

            {/* Respectful Callout Block */}
            <div className="ka-card p-6 rounded-3xl border border-amber-500/20 bg-amber-500/5 text-xs text-[var(--text-secondary)] leading-relaxed">
              <span className="font-bold text-amber-300 block mb-1">
                {isHindi ? "संपादकीय टिप्पणी / Source Note:" : "Editorial & Source Note:"}
              </span>
              <p>
                {isHindi
                  ? "प्रस्तुत विवरण प्रांतीय बैरवा प्रगति संस्था एवं समाज में उपलब्ध ऐतिहासिक दस्तावेजों, स्मारिकाओं व सामाजिक मान्यताओं पर आधारित है।"
                  : "This compilation is based on historical souvenirs, records, and authentic traditions documented by Prantiya Bairwa Pragati Sanstha, Jaipur."}
              </p>
            </div>
          </main>
        </div>
      </section>

      {/* Footer */}
      <ModernFooter />
    </div>
  );
};

export default HistoryPage;
