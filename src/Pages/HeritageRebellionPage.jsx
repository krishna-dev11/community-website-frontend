import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiBookOpen,
  FiMapPin,
  FiAward,
  FiCheckCircle,
  FiArrowRight,
  FiAlertTriangle,
  FiUsers,
  FiCompass,
} from "react-icons/fi";
import { GiAncientSword, GiSprout, GiForestCamp } from "react-icons/gi";
import ModernFooter from "../Components/Core/Home/ModernFooter";
import { organizationInfo } from "../data/halbaData";
import { useLanguage } from "../i18n/LanguageContext";
import { useScrollReveal } from "../Utilities/useScrollReveal";

const HeritageRebellionPage = () => {
  const { isHindi } = useLanguage();
  const pageRef = useRef(null);
  useScrollReveal(pageRef);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      ref={pageRef}
      className="relative min-h-screen w-full max-w-full overflow-x-hidden bg-[var(--bg)] text-[var(--text-primary)] transition-colors duration-300"
    >
      {/* Hero Header */}
      <section className="relative pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-4">
          <FiShield size={13} />
          <span>{isHindi ? "ऐतिहासिक धरोहर एवं जनजातीय शौर्य" : "Historic Heritage & Tribal Valor"}</span>
        </div>

        <h1 className="reveal text-2xl sm:text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
          {isHindi
            ? <>""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""बस्तर धरोहर, कृषक परंपरा एवं <span className="gradient-text-brand">1774–1779</span> की हल्बा क्रांति</>
            : <>Bastar Heritage, Agricultural Roots &amp; <span className="gradient-text-brand">1774–1779</span> Halba Rebellion</>}
        </h1>

        <p className="mt-3 text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-3xl mx-auto font-normal">
          {isHindi
            ? "“गर्व से कहो हम आदिवासी हैं, भारत के मूल निवासी हैं” — मध्य भारत के खेतों से लेकर रियासती किलों तक, हल्बा/हल्बी समाज की समृद्ध ऐतिहासिक व सैन्य सेवा परंपरा का प्रामाणिक दिग्दर्शन।"
            : "From fertile fields to regional fortress guards — an authentic historical chronicle of Bastar heritage, martial traditions, and the historic resistance of Dongar."}
        </p>

        {/* Quick Nav Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 text-xs">
          <a href="#bastar" className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-amber-500/40 text-[var(--text-secondary)]">
            {isHindi ? "बस्तर से जुड़ाव" : "Bastar Connection"}
          </a>
          <a href="#fields-to-forts" className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-amber-500/40 text-[var(--text-secondary)]">
            {isHindi ? "खेतों से किलों तक (सैन्य सेवा)" : "From Fields to Forts"}
          </a>
          <a href="#rebellion" className="px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold">
            {isHindi ? "हल्बा क्रांति (1774–1779)" : "Halba Rebellion (1774–1779)"}
          </a>
          <a href="#language" className="px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] hover:border-amber-500/40 text-[var(--text-secondary)]">
            {isHindi ? "हल्बी भाषा" : "Halbi Language"}
          </a>
        </div>
      </section>

      {/* 1. Bastar Connection Section */}
      <section id="bastar" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
              <FiMapPin size={13} />
              <span>{isHindi ? "प्राचीन कर्मभूमि एवं सांस्कृतिक केंद्र" : "Ancient Homeland & Cultural Epicenter"}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "बस्तर और हल्बा समाज का अटूट संबंध" : "Halba/Halbi and the History of Bastar"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "हल्बा समुदाय की ऐतिहासिक स्मृति में बस्तर एक अत्यंत महत्वपूर्ण एवं केंद्रीय स्थान रखता है। बस्तर क्षेत्र समाज के कृषि जीवन, सैन्य परंपराओं, हल्बी भाषा, धार्मिक मान्यताओं और 1774–1779 की ऐतिहासिक क्रांति से गहराई से जुड़ा हुआ है।"
                : "Bastar occupies a central place in the historical memory of the Halba community — linked to the community's agricultural life, military traditions, language, religion, and the 1774–1779 rebellion."}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "1961 के बस्तर सेंसस हैंडबुक में उल्लेख मिलता है कि हल्बी भाषा बस्तर क्षेत्र में व्यापक रूप से संपर्क भाषा (Lingua Franca) के रूप में प्रयुक्त होती थी, यद्यपि यह भाषा केवल हल्बा जनजाति तक ही सीमित नहीं थी। बस्तर के सामाजिक ताने-बाने में हल्बा समुदाय ने कृषि, भूमि-प्रबंधन एवं रियासती सुरक्षा में विशिष्ट भूमिका निभाई।"
                : "The 1961 Bastar Census Handbook noted that Halbi functioned as a regional lingua franca in Bastar, while being clear that the language was not spoken exclusively by the Halba tribe."}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <GiSprout size={20} />
                </div>
                <h3 className="font-bold text-sm text-[var(--text-primary)]">
                  {isHindi ? "नाम का अर्थ एवं कृषक पहचान" : "Meaning of the Name 'Halba'"}
                </h3>
              </div>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {isHindi
                  ? "हल्बा नाम का एक सर्वविदित संबंध 'हल' (कृषि) से जोड़ा जाता है, जो समाज की पारंपरिक खेती और भूमि-संलग्नता को दर्शाता है। रसेल व हीरालाल के ऐतिहासिक नृवंशविज्ञान सहित पुराने स्रोतों में समाज की उत्पत्ति से संबंधित विभिन्न मौखिक परंपराएं भी संरक्षित हैं।"
                  : "The name Halba is commonly associated with agricultural heritage ('Hal' / plough), while historical literature records multiple traditions regarding the community's origins. These traditions reflect the diversity of oral history surrounding the Halba/Halbi community."}
              </p>
              <div className="p-3 rounded-2xl bg-[var(--surface)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)]">
                {isHindi
                  ? "आरंभिक गृहक्षेत्र: दक्षिण रायपुर, कांकेर, बस्तर, सिहावा क्षेत्र से लेकर आगे भंडारा व विदर्भ तक।"
                  : "Early Homeland: Southern Raipur, Kanker, Bastar, and Sihawa regions with later westward movement."}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. From Fields to Forts Section */}
      <section id="fields-to-forts" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-3">
            <GiAncientSword size={14} />
            <span>{isHindi ? "खेतों से किलों तक: ऐतिहासिक सेवा परंपरा" : "From Fields to Forts: The Historical Service Tradition"}</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
            {isHindi ? "सैन्य एवं प्रशासनिक सहभागिता का गौरव" : "Military & Administrative Heritage"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2">
            {isHindi
              ? "ऐतिहासिक विवरणों में हल्बा समुदाय को केवल कृषकों के रूप में ही नहीं, बल्कि क्षेत्रीय रियासतों के रक्षक, सैनिक एवं सैन्य सहयोगियों के रूप में भी दर्ज किया गया है।"
              : "Historical records describe Halba communities not only as cultivators but also as soldiers, guards and service groups associated with regional kingdoms of Central India."}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="reveal reveal-delay-1 hover-lift ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
              01
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              {isHindi ? "रियासती रक्षक व सैनिक सेवा" : "Guard & Militia Roles"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "पुराने ऐतिहासिक वृत्तांतों के अनुसार, बस्तर एवं रतनपुर के क्षेत्रीय शासकों के अधीन हल्बा सैनिक दस्ते सुरक्षा, निगरानी एवं दुर्ग रक्षा के महत्वपूर्ण दायित्वों का निर्वहन करते थे।"
                : "Historical accounts record Halba groups serving in militia and guard roles under regional ruling dynasties in Bastar and adjoining Central Indian kingdoms."}
            </p>
          </div>

          <div className="reveal reveal-delay-2 hover-lift ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              02
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              {isHindi ? "भू-स्वामित्व एवं सामाजिक प्रतिष्ठा" : "Landholding & Settlement"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "सेवा काल के दौरान कुछ हल्बा समूहों ने भूमि-स्वामित्व एवं ग्राम प्रमुख के अधिकार प्राप्त किए, जिससे समाज में कृषक-सैनिक की विशिष्ट द्वैध पहचान स्थापित हुई।"
                : "Over time, several Halba military and service groups acquired landholding status, creating an enduring dual identity of disciplined cultivation and community leadership."}
            </p>
          </div>

          <div className="reveal reveal-delay-3 hover-lift ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold">
              03
            </div>
            <h3 className="font-bold text-sm text-[var(--text-primary)]">
              {isHindi ? "पश्चिम की ओर प्रवास (चांदा राज्य)" : "Westward Movement to Chanda"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "ऐतिहासिक अभिलेख यह भी बताते हैं कि सैन्य सेवा से जुड़े कुछ हल्बा सैनिक पश्चिम की ओर बढ़े और चांदा (वर्तमान चंद्रपुर/महाराष्ट्र) के गोंड शासकों की सेवा में शामिल हुए।"
                : "Historical records describe westward movement of some military-associated Halba groups into the service of Gond rulers in the Chanda region."}
            </p>
          </div>
        </div>
      </section>

      {/* 3. Halba Rebellion 1774-1779 (Strict Mandatory Cautionary Phrasing) */}
      <section id="rebellion" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="ka-card p-6 sm:p-10 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-[var(--surface-elevated)] to-[var(--surface)] shadow-lg space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <FiAlertTriangle size={15} />
              <span>{isHindi ? "ऐतिहासिक अध्याय • 1774–1779" : "HISTORICAL CONTEXT • 1774–1779"}</span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 font-bold border border-amber-500/30">
              {isHindi ? "नेतृत्व: अजमेर सिंह | केंद्र: डोंगर (बस्तर)" : "Leader: Ajmer Singh | Center: Dongar (Bastar)"}
            </span>
          </div>

          <div>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "हल्बा क्रांति (1774–1779) का ऐतिहासिक संदर्भ" : "The Halba Rebellion (1774–1779)"}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {organizationInfo.halbaRebellion.background}
            </p>
          </div>

          {/* MANDATORY SAFE WORDING BOX */}
          <div className="p-5 sm:p-6 rounded-2xl border-2 border-amber-500/40 bg-[var(--surface)] relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-3 py-0.5 rounded-bl-lg">
              Official Historic Record
            </div>
            <p className="text-sm sm:text-base font-bold text-[var(--text-primary)] italic leading-relaxed">
              “{isHindi ? organizationInfo.halbaRebellion.mandatoryTextHi : organizationInfo.halbaRebellion.mandatoryText}”
            </p>
          </div>

          {/* Context Pillars */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">उत्तराधिकार विवाद</span>
              <p className="text-[var(--text-secondary)] mt-1">दलपत देव के निधन पश्चात दरियाव देव एवं अजमेर सिंह के मध्य सत्ता संघर्ष।</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">डोंगर का केंद्र</span>
              <p className="text-[var(--text-secondary)] mt-1">डोंगर के प्रशासक अजमेर सिंह द्वारा हल्बा योद्धाओं के सहयोग से संगठित प्रतिरोध।</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">दुर्भिक्ष व भूमि संकट</span>
              <p className="text-[var(--text-secondary)] mt-1">क्षेत्र में भीषण सूखा, अकाल व भूमि संकट जिसने जन-असंतोष को व्यापक बनाया।</p>
            </div>
            <div className="p-3.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]">
              <span className="text-[10px] font-bold uppercase text-amber-400 block">बाहरी राजनीतिक प्रभाव</span>
              <p className="text-[var(--text-secondary)] mt-1">मराठों, ब्रिटिश ईस्ट इंडिया कंपनी तथा 1778 की कोटपाड़ संधि की ऐतिहासिक भूमिका।</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Halbi Language Section */}
      <section id="language" className="py-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[var(--border-subtle)]">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-400">
              <FiBookOpen size={13} />
              <span>{isHindi ? "भाषाई धरोहर" : "Linguistic Heritage"}</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-[var(--text-primary)]">
              {isHindi ? "हल्बी (बस्तरी) भाषा का सांस्कृतिक वैशिष्ट्य" : "Halbi Language: A Cultural Bridge"}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "हल्बी (जिसे बस्तरी या हलाबी भी कहा जाता है) पूर्वी इंडो-आर्यन भाषा वर्ग से संबंधित है। भाषाविदों के अनुसार यह ओड़िया, मराठी एवं छत्तीसगढ़ी के संगम स्थल की एक महत्वपूर्ण संपर्क भाषा है। यह विभिन्न क्षेत्रों में देवनागरी एवं ओड़िया लिपि में लिखी जाती रही है।"
                : "Halbi (also called Bastari/Halabi) is classified as an Eastern Indo-Aryan language, described by linguists as transitional between Odia and Marathi, reflecting the region where Marathi, Odia and Chhattisgarhi influences meet. Written using Odia and Devanagari scripts in different areas."}
            </p>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {isHindi
                ? "जनगणना 2011 के अनुसार, हल्बी मातृभाषा भाषियों की संख्या 7,66,297 दर्ज की गई, जो मुख्य रूप से छत्तीसगढ़, ओडिशा एवं महाराष्ट्र में केंद्रित है।"
                : "According to Census 2011, Halbi mother-tongue speakers numbered 766,297, concentrated across Chhattisgarh, Odisha, and Maharashtra."}
            </p>
          </div>

          <div className="ka-card p-6 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2">
              {isHindi ? "धरोहर के अन्य महत्वपूर्ण पृष्ठ" : "Explore Related Heritage Sections"}
            </h3>
            <div className="space-y-2">
              <Link to="/culture" className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--surface)] text-xs font-bold">
                <span>{isHindi ? "सांस्कृतिक परंपराएं, दनकुल व पर्व" : "Cultural Traditions, Dankul & Festivals"}</span>
                <FiArrowRight size={14} className="text-[var(--accent-primary)]" />
              </Link>
              <Link to="/faith" className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--surface)] text-xs font-bold">
                <span>{isHindi ? "उज्जैन समिति आराध्य देव (ग्राम देव, मोथो, कारू बोआ)" : "Revered Deities & Ujjain Heritage"}</span>
                <FiArrowRight size={14} className="text-[var(--accent-primary)]" />
              </Link>
              <Link to="/history" className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--surface)] text-xs font-bold">
                <span>{isHindi ? "हल्बा समुदाय का 7 चरणों का कालक्रम" : "Seven Historical Phases & Timeline"}</span>
                <FiArrowRight size={14} className="text-[var(--accent-primary)]" />
              </Link>
              <Link to="/constitutional-status" className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] bg-[var(--surface)] text-xs font-bold">
                <span>{isHindi ? "संवैधानिक दर्जा एवं 2011 जनगणना आंकड़े" : "Constitutional Status & Census 2011"}</span>
                <FiArrowRight size={14} className="text-[var(--accent-primary)]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ModernFooter />
    </div>
  );
};

export default HeritageRebellionPage;
