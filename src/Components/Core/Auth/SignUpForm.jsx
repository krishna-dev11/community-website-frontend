import { useState } from "react";
import { FiArrowRight, FiBriefcase, FiCalendar, FiFileText, FiHome, FiLock, FiMail, FiMapPin, FiShield, FiUser } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSignUpData } from "../../../Slices/Auth";
import { sendOtp } from "../../../services/Operations/authAPI";
import { ACCOUNT_TYPE } from "../../../Utilities/Constaints";

const registrationSteps = [
  "Submit member application",
  "Verify email with OTP",
  "Committee review",
  "Account activation",
];

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    contactNumber: "",
    dateOfBirth: "",
    gender: "",
    nativePlace: "",
    currentCity: "",
    education: "",
    profession: "",
    gotra: "",
    address: "",
    about: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const payload = {
      ...formData,
      email: formData.email.trim().toLowerCase(),
      accountType: ACCOUNT_TYPE.MEMBER,
    };

    const otpSent = await dispatch(sendOtp(payload.email));
    if (otpSent) {
      dispatch(setSignUpData(payload));
      navigate("/enterOtp");
    }
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/50";

  return (
    <main className="min-h-screen bg-[#071412] px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-6 lg:sticky lg:top-28 lg:self-start">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-400 text-black">
              <FiShield size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Samaj Portal</p>
              <h1 className="text-2xl font-black tracking-normal text-white">Member Registration</h1>
            </div>
          </div>

          <p className="text-sm leading-6 text-white/62">
            Register as a Samaj member. Your account will stay pending until the committee reviews and approves the application.
          </p>

          <div className="mt-8 grid gap-4">
            {registrationSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${index === 0 ? "bg-emerald-400 text-black" : "border border-white/15 text-white/45"}`}>
                  {index + 1}
                </div>
                <p className="text-sm font-semibold text-white/75">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50/80">
            Admin accounts are not self-registered. Super Admin creates an invite and assigns admin roles after verification.
          </div>
        </aside>

        <form onSubmit={submitHandler} className="rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:p-7">
          <div className="mb-7 border-b border-white/10 pb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Application Details</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-white">Create your member application</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-white/55">
              These details become your community profile after approval. You can update profile information later from the dashboard.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label>
              <span className={labelClass}>First name</span>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input required name="firstName" value={formData.firstName} onChange={changeHandler} className={`${inputClass} pl-10`} placeholder="First name" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Last name</span>
              <input required name="lastName" value={formData.lastName} onChange={changeHandler} className={inputClass} placeholder="Last name" />
            </label>

            <label>
              <span className={labelClass}>Email</span>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input required type="email" name="email" value={formData.email} onChange={changeHandler} className={`${inputClass} pl-10`} placeholder="you@example.com" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Contact number</span>
              <input name="contactNumber" value={formData.contactNumber} onChange={changeHandler} className={inputClass} placeholder="+91..." />
            </label>

            <label>
              <span className={labelClass}>Password</span>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input required type="password" name="password" value={formData.password} onChange={changeHandler} className={`${inputClass} pl-10`} placeholder="Create password" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Confirm password</span>
              <input required type="password" name="confirmPassword" value={formData.confirmPassword} onChange={changeHandler} className={inputClass} placeholder="Confirm password" />
            </label>

            <label>
              <span className={labelClass}>Date of birth</span>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={changeHandler} className={`${inputClass} pl-10`} />
              </div>
            </label>

            <label>
              <span className={labelClass}>Gender</span>
              <select name="gender" value={formData.gender} onChange={changeHandler} className={inputClass}>
                <option value="">Select gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>

            <label>
              <span className={labelClass}>Native place</span>
              <div className="relative">
                <FiHome className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input name="nativePlace" value={formData.nativePlace} onChange={changeHandler} className={`${inputClass} pl-10`} placeholder="Native place" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Current city</span>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input name="currentCity" value={formData.currentCity} onChange={changeHandler} className={`${inputClass} pl-10`} placeholder="Current city" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Education</span>
              <input name="education" value={formData.education} onChange={changeHandler} className={inputClass} placeholder="Education" />
            </label>

            <label>
              <span className={labelClass}>Profession</span>
              <div className="relative">
                <FiBriefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input name="profession" value={formData.profession} onChange={changeHandler} className={`${inputClass} pl-10`} placeholder="Profession" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Gotra</span>
              <input name="gotra" value={formData.gotra} onChange={changeHandler} className={inputClass} placeholder="Gotra" />
            </label>

            <label>
              <span className={labelClass}>Address</span>
              <input name="address" value={formData.address} onChange={changeHandler} className={inputClass} placeholder="Address" />
            </label>
          </div>

          <label className="mt-5 block">
            <span className={labelClass}>About / family reference</span>
            <div className="relative">
              <FiFileText className="absolute left-3 top-4 text-white/35" />
              <textarea name="about" value={formData.about} onChange={changeHandler} rows={4} className={`${inputClass} resize-none pl-10`} placeholder="Short introduction or reference for verification" />
            </div>
          </label>

          <button type="submit" className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-4 text-sm font-black uppercase tracking-wider text-black transition hover:bg-emerald-300">
            Send OTP and Continue
            <FiArrowRight size={17} />
          </button>

          <p className="mt-5 text-center text-sm text-white/45">
            Already approved? <Link to="/login" className="font-bold text-emerald-300 hover:text-emerald-200">Login here</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default SignUpForm;
