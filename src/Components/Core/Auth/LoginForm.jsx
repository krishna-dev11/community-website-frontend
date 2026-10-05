import { useState } from "react";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUserCheck,
  FiUser,
  FiCheckCircle,
  FiX,
  FiKey,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { settoken } from "../../../Slices/Auth";
import { setUser } from "../../../Slices/Profile";
import {
  setLogin,
  claimProfileRequestOtp,
  claimProfileVerify,
} from "../../../services/Operations/authAPI";
import { apiConnector } from "../../../services/apiConnector";
import { useLanguage } from "../../../i18n/LanguageContext";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  // Forced Password Change Modal State
  const [showMustChangeModal, setShowMustChangeModal] = useState(false);
  const [pwdChangeForm, setPwdChangeForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [pwdChanging, setPwdChanging] = useState(false);

  // Claim Profile Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimStep, setClaimStep] = useState(1);
  const [claimIdentifier, setClaimIdentifier] = useState("");
  const [claimSession, setClaimSession] = useState(null);
  const [claimOtp, setClaimOtp] = useState("");
  const [claimNewPassword, setClaimNewPassword] = useState("");
  const [claimConfirmPassword, setClaimConfirmPassword] = useState("");

  const { language, setLanguage, isHindi } = useLanguage();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const t = {
    officialPortal: isHindi ? "आधिकारिक पोर्टल" : "Official Portal",
    samajName: isHindi ? "आदिवासी हलबा/हल्बी समाज" : "Adivasi Halba/Halbi Samaj",
    samiti: isHindi ? "कल्याण समिति, उज्जैन" : "Kalyan Samiti, Ujjain",
    login: isHindi ? "समाज सदस्य लॉगिन" : "Member Login",
    loginDescription: isHindi
      ? "अपने Member ID (उदा. SMJ-123456) या registered email और password से लॉगिन करें।"
      : "Enter using your Member ID (e.g. SMJ-123456) or registered email and password.",
    identifierLabel: isHindi
      ? "सदस्य आईडी या ईमेल पता (Member ID / Email)"
      : "Member ID or Email Address",
    identifierPlaceholder: isHindi
      ? "जैसे SMJ-XXXXXX या पंजीकृत ईमेल"
      : "e.g. SMJ-XXXXXX or registered email",
    password: isHindi ? "पासवर्ड" : "Password",
    passwordPlaceholder: isHindi ? "अपना password दर्ज करें" : "Enter your password",
    forgotPassword: isHindi ? "पासवर्ड भूल गए?" : "Forgot password?",
    loginButton: isHindi ? "पोर्टल में लॉगिन करें" : "Login to Portal",
    notMember: isHindi ? "अभी समाज के सदस्य नहीं हैं?" : "Not a member yet?",
    register: isHindi ? "पारिवारिक सदस्यता पंजीकरण करें" : "Register Family Membership",
    security: isHindi ? "केवल अधिकृत सदस्य एवं प्रशासक" : "Authorized members & administrators only",
    showPassword: isHindi ? "पासवर्ड दिखाएं" : "Show password",
    hidePassword: isHindi ? "पासवर्ड छिपाएं" : "Hide password",
  };

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(
      setLogin(
        formData.identifier,
        formData.password,
        navigate,
        (mustChange) => {
          if (mustChange) {
            setPwdChangeForm((prev) => ({ ...prev, oldPassword: formData.password }));
            setShowMustChangeModal(true);
          }
        }
      )
    );
  };

  // Mandatory Password Change submit
  const handleForcedPasswordChange = async (e) => {
    e.preventDefault();
    if (pwdChangeForm.newPassword !== pwdChangeForm.confirmNewPassword) {
      toast.error("नया पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं।");
      return;
    }
    setPwdChanging(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_URL;
      const token = JSON.parse(localStorage.getItem("token"));
      const response = await apiConnector(
        "POST",
        `${BASE_URL}/auth/changePassword`,
        pwdChangeForm,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      const freshToken = response.data?.data?.accessToken || response.data?.data?.token;
      if (!freshToken) {
        throw new Error("Password changed, but the server did not return a fresh login session. Please log in again.");
      }
      dispatch(settoken(freshToken));
      localStorage.setItem("token", JSON.stringify(freshToken));
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        const updatedUser = { ...currentUser, mustChangePassword: false };
        dispatch(setUser(updatedUser));
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      toast.success("पासवर्ड सफलतापूर्वक बदल गया! स्वागत है।");
      setShowMustChangeModal(false);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "पासवर्ड बदलने में त्रुटि हुई");
    } finally {
      setPwdChanging(false);
    }
  };

  // Claim Profile Step 1: Request OTP
  const handleClaimRequestOtp = async (e) => {
    e.preventDefault();
    if (!claimIdentifier) {
      toast.error("कृपया अपना सदस्य आईडी (SMJ-XXXXXX) या आधार क्रमांक दर्ज करें।");
      return;
    }
    const data = await dispatch(claimProfileRequestOtp(claimIdentifier));
    if (data) {
      setClaimSession(data);
      setClaimStep(2);
    }
  };

  // Claim Profile Step 2: Verify & Activate
  const handleClaimVerify = async (e) => {
    e.preventDefault();
    if (!claimOtp || !claimNewPassword) {
      toast.error("कृपया प्राप्त ओटीपी और नया पासवर्ड दर्ज करें।");
      return;
    }
    if (claimNewPassword !== claimConfirmPassword) {
      toast.error("पासवर्ड और कन्फर्म पासवर्ड मेल नहीं खा रहे हैं।");
      return;
    }
    const success = await dispatch(
      claimProfileVerify(
        {
          memberKey: claimSession.memberKey,
          sessionToken: claimSession.sessionToken,
          otp: claimOtp,
          newPassword: claimNewPassword,
          confirmNewPassword: claimConfirmPassword,
        },
        navigate
      )
    );
    if (success) {
      setShowClaimModal(false);
    }
  };

  const inputClass = "ka-input";
  const labelClass =
    "mb-1.5 block text-[11px] font-bold tracking-wide text-[var(--text-secondary)]";

  return (
    <main className="relative min-h-screen bg-[var(--bg)] px-4 pb-12 pt-24 text-[var(--text-primary)] transition-colors duration-300 sm:px-6 lg:px-8">
      {/* Top Bar */}
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
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
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
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              language === "en"
                ? "bg-[var(--accent-primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-xl lg:grid-cols-[42%_58%]">
        {/* Left Side Branding */}
        <div className="relative hidden flex-col justify-between border-r border-[var(--border)] bg-[var(--surface-elevated)] p-10 lg:flex">
          <div>
            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-[var(--accent-primary)]/20 bg-white/5 p-1 shadow-sm">
              <img
                src="/logo.png"
                alt={t.samajName}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="eyebrow-badge mt-6 mb-2">{t.officialPortal}</p>
            <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">
              {t.samajName}
            </h1>
            <p className="text-xs font-semibold text-[var(--text-secondary)]">
              {t.samiti}
            </p>
            <p className="mt-4 text-xs leading-5 text-[var(--text-muted)]">
              सदस्यता, परिवार, धर्मशाला, योगदान, अवसर और अन्य सामुदायिक सेवाओं से जुड़ी सुविधाएं एक ही पारिवारिक मंच पर उपलब्ध हैं।
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-4 text-xs">
            <span className="font-bold text-[var(--accent-primary)]">💡 नया पारिवारिक मॉडल:</span>{" "}
            अब परिवार के प्रत्येक सदस्य के पास स्वतंत्र Member ID (उदा. SMJ-123456) उपलब्ध है जिससे वे सीधे लॉगिन कर सकते हैं।
          </div>
        </div>

        {/* Right Side Form */}
        <div className="p-8 sm:p-10">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-[var(--text-primary)]">{t.login}</h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">{t.loginDescription}</p>
          </div>

          <form onSubmit={submitHandler} className="space-y-4">
            <div>
              <label htmlFor="login-identifier" className={labelClass}>
                {t.identifierLabel}
              </label>
              <div className="relative">
                <FiUser
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  id="login-identifier"
                  required
                  type="text"
                  name="identifier"
                  value={formData.identifier}
                  onChange={changeHandler}
                  className={`${inputClass} w-full pl-11 font-medium`}
                  placeholder={t.identifierPlaceholder}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className={labelClass}>
                {t.password}
              </label>
              <div className="relative">
                <FiLock
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
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
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setShowClaimModal(true)}
                className="font-bold text-[var(--accent-primary)] hover:underline cursor-pointer"
              >
                🔗 प्रोफ़ाइल सक्रिय करें (Claim Profile)
              </button>

              <Link
                to="/forgotPassword"
                className="font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                {t.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary !py-3 mt-4 flex w-full items-center justify-center gap-2 font-bold cursor-pointer"
            >
              <span>{t.loginButton}</span>
              <FiArrowRight size={16} />
            </button>

            <div className="mt-6 border-t border-[var(--border)] pt-5 text-center">
              <p className="text-xs text-[var(--text-muted)]">{t.notMember}</p>
              <Link
                to="/signup"
                className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-[var(--accent-primary)] hover:opacity-85"
              >
                <span>{t.register}</span>
                <FiArrowRight size={13} />
              </Link>
            </div>
          </form>
        </div>
      </section>

      {/* =====================================================
          MANDATORY PASSWORD CHANGE MODAL (FIRST LOGIN)
      ====================================================== */}
      {showMustChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[var(--accent-primary)]/40 bg-[var(--surface-elevated)] p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                <FiKey size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-[var(--text-primary)]">
                  व्यक्तिगत पासवर्ड सेट करें (Set Password)
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  परिवार के मुखिया द्वारा दिए गए अस्थायी पासवर्ड को बदलकर अपना निजी पासवर्ड बनाएं।
                </p>
              </div>
            </div>

            <form onSubmit={handleForcedPasswordChange} className="space-y-4">
              <div>
                <span className={labelClass}>वर्तमान अस्थायी पासवर्ड *</span>
                <input
                  required
                  type="password"
                  value={pwdChangeForm.oldPassword}
                  onChange={(e) =>
                    setPwdChangeForm((prev) => ({ ...prev, oldPassword: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="अस्थायी पासवर्ड दर्ज करें"
                />
              </div>

              <div>
                <span className={labelClass}>नया निजी पासवर्ड *</span>
                <input
                  required
                  type="password"
                  value={pwdChangeForm.newPassword}
                  onChange={(e) =>
                    setPwdChangeForm((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="नया मजबूत पासवर्ड"
                />
              </div>

              <div>
                <span className={labelClass}>नया पासवर्ड दोबारा दर्ज करें *</span>
                <input
                  required
                  type="password"
                  value={pwdChangeForm.confirmNewPassword}
                  onChange={(e) =>
                    setPwdChangeForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))
                  }
                  className={inputClass}
                  placeholder="कन्फर्म पासवर्ड"
                />
              </div>

              <button
                type="submit"
                disabled={pwdChanging}
                className="btn-primary !py-2.5 w-full font-bold cursor-pointer disabled:opacity-50 mt-2"
              >
                {pwdChanging ? "पासवर्ड अपडेट हो रहा है..." : "पासवर्ड सुरक्षित करें व जारी रखें"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          CLAIM PROFILE MODAL (FOR DEPENDENT MEMBERS)
      ====================================================== */}
      {showClaimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-2xl">
            <button
              onClick={() => setShowClaimModal(false)}
              className="absolute right-4 top-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded-lg"
            >
              <FiX size={18} />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-primary)]/10 px-3 py-1 text-[10px] font-bold text-[var(--accent-primary)] uppercase">
                <FiUserCheck size={12} />
                <span>Existing Member Access</span>
              </div>
              <h3 className="mt-2 text-xl font-black text-[var(--text-primary)]">
                अपनी प्रोफ़ाइल सक्रिय करें (Claim Profile)
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                यदि आपके परिवार के मुखिया ने पहले ही परिवार में आपका नाम पंजीकृत किया हुआ है, तो आप यहां से अपना खाता सक्रिय कर सकते हैं।
              </p>
            </div>

            {claimStep === 1 ? (
              <form onSubmit={handleClaimRequestOtp} className="space-y-4">
                <div>
                  <span className={labelClass}>सदस्य आईडी (Member ID) या आधार संख्या *</span>
                  <input
                    required
                    value={claimIdentifier}
                    onChange={(e) => setClaimIdentifier(e.target.value)}
                    className={inputClass}
                    placeholder="उदा. SMJ-123456 या आधार क्रमांक"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                    सुरक्षा के लिए, आपके पंजीकृत ईमेल/फ़ोन पर सत्यापन कोड भेजा जाएगा।
                  </span>
                </div>

                <button
                  type="submit"
                  className="btn-primary !py-2.5 w-full font-bold cursor-pointer"
                >
                  ओटीपी भेजें (Send Verification OTP)
                </button>
              </form>
            ) : (
              <form onSubmit={handleClaimVerify} className="space-y-4">
                <p className="text-xs text-emerald-400 font-semibold">
                  सत्यापन कोड भेजा गया: {claimSession?.maskedContact}
                </p>

                <div>
                  <span className={labelClass}>6-अंकीय ओटीपी *</span>
                  <input
                    required
                    maxLength={6}
                    value={claimOtp}
                    onChange={(e) => setClaimOtp(e.target.value)}
                    className={`${inputClass} text-center font-mono tracking-widest text-base`}
                    placeholder="123456"
                  />
                </div>

                <div>
                  <span className={labelClass}>अपना नया पासवर्ड सेट करें *</span>
                  <input
                    required
                    type="password"
                    value={claimNewPassword}
                    onChange={(e) => setClaimNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="नया पासवर्ड"
                  />
                </div>

                <div>
                  <span className={labelClass}>कन्फर्म पासवर्ड *</span>
                  <input
                    required
                    type="password"
                    value={claimConfirmPassword}
                    onChange={(e) => setClaimConfirmPassword(e.target.value)}
                    className={inputClass}
                    placeholder="पासवर्ड दोबारा दर्ज करें"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setClaimStep(1)}
                    className="btn-secondary !py-2 !px-4 text-xs font-bold"
                  >
                    वापस
                  </button>
                  <button
                    type="submit"
                    className="btn-primary !py-2.5 flex-1 font-bold cursor-pointer"
                  >
                    सत्यापित करें व लॉगिन करें
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default LoginForm;