import { useState } from "react";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUserCheck,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../services/Operations/authAPI";
import { useLanguage } from "../../../i18n/LanguageContext";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // =========================
  // LANGUAGE (Global LanguageContext)
  // =========================
  const { language, setLanguage, isHindi } = useLanguage();

  // =========================
  // TRANSLATIONS
  // =========================
  const t = {
    officialPortal: isHindi ? "आधिकारिक पोर्टल" : "Official Portal",

    samajName: isHindi
      ? "आदिवासी हलबा/हल्बी समाज"
      : "Adivasi Halba/Halbi Samaj",

    samiti: isHindi
      ? "कल्याण समिति, उज्जैन"
      : "Kalyan Samiti, Ujjain",

    samajPortal: isHindi ? "समाज पोर्टल" : "Community Portal",

    yourCommunity: isHindi ? "आपका समाज," : "Your Community,",

    yourDigitalPlatform: isHindi
      ? "आपका डिजिटल मंच।"
      : "Your Digital Platform.",

    communityDescription: isHindi
      ? "सदस्यता, परिवार, धर्मशाला, योगदान, अवसर, कार्यक्रम और अन्य सामुदायिक सेवाओं से जुड़ी सुविधाएं एक ही पोर्टल पर उपलब्ध हैं।"
      : "Membership, family, Dharamshala, contributions, opportunities, events and other community services are available on one platform.",

    approvedMember: isHindi ? "स्वीकृत सदस्य" : "Approved Members",

    verifiedAccounts: isHindi
      ? "समिति द्वारा सत्यापित सदस्य खाते"
      : "Committee-verified member accounts",

    secureAccess: isHindi ? "सुरक्षित पहुंच" : "Secure Access",

    authorizedAccounts: isHindi
      ? "अधिकृत खातों के लिए सुरक्षित लॉगिन"
      : "Secure login for authorized accounts",

    tagline: isHindi
      ? "गर्व से कहो हम आदिवासी हैं,\nभारत के मूल निवासी हैं"
      : "Proudly say, we are Adivasi,\nThe original inhabitants of India",

    memberAccess: isHindi ? "सदस्य प्रवेश" : "Member Access",

    login: isHindi ? "समाज सदस्य लॉगिन" : "Member Login",

    loginDescription: isHindi
      ? "अपने registered email और password के माध्यम से Samaj Portal में प्रवेश करें।"
      : "Enter the Samaj Portal using your registered email and password.",

    email: isHindi ? "ईमेल पता" : "Email Address",

    emailPlaceholder: isHindi
      ? "अपना registered email दर्ज करें"
      : "Enter your registered email",

    password: isHindi ? "पासवर्ड" : "Password",

    passwordPlaceholder: isHindi
      ? "अपना password दर्ज करें"
      : "Enter your password",

    forgotPassword: isHindi ? "पासवर्ड भूल गए?" : "Forgot password?",

    loginButton: isHindi ? "पोर्टल में लॉगिन करें" : "Login to Portal",

    notMember: isHindi
      ? "अभी समाज के सदस्य नहीं हैं?"
      : "Not a member yet?",

    register: isHindi
      ? "सदस्यता के लिए पंजीकरण करें"
      : "Register for Membership",

    security: isHindi
      ? "केवल अधिकृत सदस्य एवं प्रशासक"
      : "Authorized members & administrators only",

    showPassword: isHindi ? "पासवर्ड दिखाएं" : "Show password",

    hidePassword: isHindi ? "पासवर्ड छिपाएं" : "Hide password",

    logoAlt: isHindi
      ? "आदिवासी हलबा/हल्बी समाज लोगो"
      : "Adivasi Halba/Halbi Samaj Logo",
  };

  // =========================
  // REDUX / NAVIGATION
  // =========================
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // =========================
  // INPUT HANDLER
  // =========================
  const changeHandler = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SUBMIT
  // EXISTING LOGIN FUNCTIONALITY
  // UNCHANGED
  // =========================
  const submitHandler = (event) => {
    event.preventDefault();

    // DO NOT CHANGE EXISTING LOGIN FUNCTIONALITY
    dispatch(setLogin(formData.email, formData.password, navigate));
  };

  // =========================
  // STYLES
  // =========================
  const inputClass = "ka-input";

  const labelClass =
    "mb-1.5 block text-[11px] font-bold tracking-wide text-[var(--text-secondary)]";

  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-12 pt-24 text-[var(--text-primary)] transition-colors duration-300 sm:px-6 lg:px-8">
      {/* =====================================================
          TOP BAR (BACK LINK & LANGUAGE TOGGLE)
      ====================================================== */}
      <div className="mx-auto mb-4 flex w-full max-w-5xl items-center justify-between px-1">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-primary)]"
        >
          <span>←</span>
          <span>{isHindi ? "मुख्य पृष्ठ पर वापस जाएं" : "Back to Home"}</span>
        </Link>

        <div className="flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setLanguage("hi")}
            aria-label="Switch to Hindi"
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
              language === "hi"
                ? "bg-[var(--accent-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            हिंदी
          </button>

          <button
            type="button"
            onClick={() => setLanguage("en")}
            aria-label="Switch to English"
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
              language === "en"
                ? "bg-[var(--accent-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* =====================================================
          VERY SUBTLE BACKGROUND TEXTURE
      ====================================================== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--accent-primary)]/[0.025] blur-3xl" />
      </div>

      {/* =====================================================
          MAIN LOGIN CARD
      ====================================================== */}
      <section
        className="
          mx-auto
          grid
          w-full
          max-w-5xl
          overflow-hidden
          rounded-3xl
          border border-[var(--border)]
          bg-[var(--surface)]
          shadow-xl
          lg:grid-cols-[42%_58%]
        "
      >
        {/* =====================================================
            LEFT — SAMAJ IDENTITY
        ====================================================== */}
        <aside
          className="
            relative
            border-b border-[var(--border)]
            bg-[var(--surface-raised)]
            p-7
            sm:p-9
            lg:border-b-0
            lg:border-r
            lg:p-10
          "
        >
          {/* Small heritage corner pattern */}
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 opacity-40">
            <div className="absolute right-5 top-5 h-16 w-16 rounded-full border border-[var(--accent-primary)]/15" />
            <div className="absolute right-9 top-9 h-8 w-8 rounded-full border border-amber-500/15" />
          </div>

          {/* Logo */}
          <div className="relative flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--accent-primary)]/25 bg-white dark:bg-black/10">
              <img
                src="/logo.png"
                alt={t.logoAlt}
                className="h-full w-full object-contain p-1.5"
              />
            </div>

            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--accent-primary)]">
                {t.officialPortal}
              </p>

              <h1 className="text-lg font-black leading-tight text-[var(--text-primary)] sm:text-xl">
                {t.samajName}
              </h1>

              <p className="mt-1 text-xs font-medium text-[var(--text-secondary)]">
                {t.samiti}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="my-8 h-px bg-[var(--border)]" />

          {/* Identity */}
          <div>
            <p className="text-xs font-bold tracking-wider text-[var(--accent-primary)]">
              {t.samajPortal}
            </p>

            <h2 className="mt-3 text-3xl font-black leading-tight tracking-tight text-[var(--text-primary)]">
              {t.yourCommunity}
              <br />
              <span className="text-[var(--accent-primary)]">
                {t.yourDigitalPlatform}
              </span>
            </h2>

            <p className="mt-4 text-sm leading-6 text-[var(--text-secondary)]">
              {t.communityDescription}
            </p>
          </div>

          {/* Small Feature List */}
          <div className="mt-8 space-y-3">
            {/* Approved Member */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary)]">
                <FiUserCheck size={15} />
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {t.approvedMember}
                </p>

                <p className="text-[11px] text-[var(--text-muted)]">
                  {t.verifiedAccounts}
                </p>
              </div>
            </div>

            {/* Secure Access */}
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <FiShield size={15} />
              </div>

              <div>
                <p className="text-xs font-bold text-[var(--text-primary)]">
                  {t.secureAccess}
                </p>

                <p className="text-[11px] text-[var(--text-muted)]">
                  {t.authorizedAccounts}
                </p>
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className="mt-9 border-l-2 border-[var(--accent-primary)]/40 pl-4">
            <p className="whitespace-pre-line text-xs italic leading-5 text-[var(--text-muted)]">
              "{t.tagline}"
            </p>
          </div>
        </aside>

        {/* =====================================================
            RIGHT — LOGIN FORM
        ====================================================== */}
        <div className="bg-[var(--surface)]">
          <form
            onSubmit={submitHandler}
            className="p-7 sm:p-10 lg:p-12"
          >
            {/* Header */}
            <div className="mb-8">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  {t.memberAccess}
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">
                {t.login}
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-[var(--text-secondary)]">
                {t.loginDescription}
              </p>
            </div>

            {/* =================================================
                EMAIL
            ================================================== */}
            <div className="mb-5">
              <label
                htmlFor="login-email"
                className={labelClass}
              >
                {t.email}
              </label>

              <div className="relative">
                <FiMail
                  size={17}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[var(--text-muted)]
                  "
                />

                <input
                  id="login-email"
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={changeHandler}
                  className={`${inputClass} w-full pl-11`}
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* =================================================
                PASSWORD
            ================================================== */}
            <div>
              <label
                htmlFor="login-password"
                className={labelClass}
              >
                {t.password}
              </label>

              <div className="relative">
                <FiLock
                  size={17}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-[var(--text-muted)]
                  "
                />

                <input
                  id="login-password"
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={changeHandler}
                  className={`${inputClass} w-full pl-11 pr-12`}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? t.hidePassword
                      : t.showPassword
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-8
                    w-8
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-lg
                    text-[var(--text-muted)]
                    transition-colors
                    hover:bg-[var(--surface-raised)]
                    hover:text-[var(--text-primary)]
                  "
                >
                  {showPassword ? (
                    <FiEyeOff size={16} />
                  ) : (
                    <FiEye size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="mt-3 flex justify-end">
              <Link
                to="/forgotPassword"
                className="
                  text-xs
                  font-semibold
                  text-[var(--accent-primary)]
                  transition-opacity
                  hover:opacity-75
                "
              >
                {t.forgotPassword}
              </Link>
            </div>

            {/* Login */}
            <button
              type="submit"
              className="
                btn-primary
                mt-7
                flex
                w-full
                items-center
                justify-center
                gap-2
              "
            >
              <span>{t.loginButton}</span>
              <FiArrowRight size={16} />
            </button>

            {/* Registration */}
            <div className="mt-7 border-t border-[var(--border)] pt-6 text-center">
              <p className="text-xs text-[var(--text-muted)]">
                {t.notMember}
              </p>

              <Link
                to="/signup"
                className="
                  mt-1
                  inline-flex
                  items-center
                  gap-1
                  text-sm
                  font-bold
                  text-[var(--accent-primary)]
                  transition-opacity
                  hover:opacity-75
                "
              >
                {t.register}
                <FiArrowRight size={13} />
              </Link>
            </div>

            {/* Security */}
            <div className="mt-7 flex items-center justify-center gap-2 text-[10px] text-[var(--text-muted)]">
              <FiShield size={12} />

              <span>{t.security}</span>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <p className="mx-auto mt-6 max-w-5xl text-center text-[10px] text-[var(--text-muted)]">
        © {new Date().getFullYear()} Adivasi Halba/Halbi Samaj Kalyan Samiti,
        Ujjain
      </p>
    </main>
  );
};

export default LoginForm;