import { useState } from "react";
import { FiArrowRight, FiEye, FiEyeOff, FiLock, FiMail, FiShield } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLogin } from "../../../services/Operations/authAPI";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submitHandler = (event) => {
    event.preventDefault();
    dispatch(setLogin(formData.email, formData.password, navigate));
  };

  const inputClass = "w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-400";
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-white/50";

  return (
    <main className="min-h-screen bg-[#071412] px-4 pb-14 pt-28 text-white sm:px-6 lg:px-8">
      <section className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-lg border border-white/10 bg-white/[0.035] lg:grid-cols-[420px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-black/20 p-7 lg:border-b-0 lg:border-r">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-400 text-black">
              <FiShield size={24} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Samaj Portal</p>
              <h1 className="text-2xl font-black tracking-normal text-white">Secure Login</h1>
            </div>
          </div>

          <p className="text-sm leading-6 text-white/62">
            Only approved and active accounts can enter the dashboard. Pending, rejected, or correction-requested applications remain blocked until reviewed.
          </p>

          <div className="mt-8 grid gap-4 text-sm text-white/68">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="font-bold text-white">Members</p>
              <p className="mt-1 text-white/55">Login after committee approval.</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="font-bold text-white">Admins</p>
              <p className="mt-1 text-white/55">Use the invited account assigned by Super Admin.</p>
            </div>
          </div>
        </aside>

        <form onSubmit={submitHandler} className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Welcome back</p>
            <h2 className="mt-2 text-3xl font-black tracking-normal text-white">Access your account</h2>
            <p className="mt-3 text-sm text-white/55">Enter your email and password to continue.</p>
          </div>

          <div className="grid gap-5">
            <label>
              <span className={labelClass}>Email</span>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input required type="email" name="email" value={formData.email} onChange={changeHandler} className={`${inputClass} pl-10`} placeholder="you@example.com" />
              </div>
            </label>

            <label>
              <span className={labelClass}>Password</span>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
                <input required type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={changeHandler} className={`${inputClass} px-10`} placeholder="Your password" />
                <button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Link to="/forgotPassword" className="text-xs font-bold uppercase tracking-wider text-emerald-300 hover:text-emerald-200">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-4 text-sm font-black uppercase tracking-wider text-black transition hover:bg-emerald-300">
            Login
            <FiArrowRight size={17} />
          </button>

          <p className="mt-6 text-center text-sm text-white/45">
            New member? <Link to="/signup" className="font-bold text-emerald-300 hover:text-emerald-200">Submit registration</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginForm;
