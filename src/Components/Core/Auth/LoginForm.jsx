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

  const inputClass = "ka-input";
  const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]";

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 pb-14 pt-28 text-[var(--text-primary)] sm:px-6 lg:px-8 transition-colors duration-300">
      <section className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left Info Panel */}
        <aside className="flex flex-col justify-between border-b border-[var(--border)] bg-[var(--surface-raised)] p-8 lg:border-b-0 lg:border-r">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
                <FiShield size={22} />
              </div>
              <div>
                <p className="eyebrow-badge mb-1">Samaj Portal</p>
                <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Secure Login</h1>
              </div>
            </div>

            <p className="text-sm leading-7 text-[var(--text-secondary)] font-normal">
              Only approved and active accounts can enter the dashboard. Pending applications remain blocked until reviewed by the committee.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="ka-card p-5">
                <p className="text-sm font-bold text-[var(--text-primary)]">Members</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Login after committee approval.</p>
              </div>
              <div className="ka-card p-5">
                <p className="text-sm font-bold text-[var(--text-primary)]">Admins</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">Use the invited account assigned by Super Admin.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-muted)]">© Samaj Community Portal. All rights reserved.</p>
          </div>
        </aside>

        {/* Right Form Panel */}
        <form onSubmit={submitHandler} className="p-7 sm:p-10">
          <div className="mb-8">
            <div className="eyebrow-badge mb-4">Welcome back</div>
            <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)] leading-tight">Access your <span className="text-gradient">account</span></h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)] font-normal">Enter your registered email and password to continue.</p>
          </div>

          <div className="grid gap-5">
            <label>
              <span className={labelClass}>Email Address</span>
              <div className="relative mt-1">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={changeHandler}
                  className={`${inputClass} pl-11`}
                  placeholder="you@example.com"
                />
              </div>
            </label>

            <label>
              <span className={labelClass}>Password</span>
              <div className="relative mt-1">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={changeHandler}
                  className={`${inputClass} pl-11 pr-11`}
                  placeholder="Your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </label>
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              to="/forgotPassword"
              className="text-xs font-bold uppercase tracking-wider text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary mt-8 w-full text-sm"
          >
            <span>Login to Portal</span>
            <FiArrowRight size={16} />
          </button>

          <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
            New member?{" "}
            <Link to="/signup" className="font-bold text-[var(--accent-primary)] hover:opacity-80 transition-opacity">
              Submit registration
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginForm;
