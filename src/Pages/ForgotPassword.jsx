import React, { useState } from "react";
import { FiArrowLeft, FiMail, FiZap } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { sendTokenLink } from "../services/Operations/authAPI";
import { useNavigate, Link } from "react-router-dom";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({ Email: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const SubmitHandler = (e) => {
    e.preventDefault();
    dispatch(sendTokenLink(formData.Email, navigate));
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] flex justify-center items-center px-4 py-16 transition-colors duration-300 overflow-hidden">
      <div className="absolute top-[10%] left-[-5%] select-none pointer-events-none opacity-[0.02] z-0">
        <h1 className="text-[18rem] font-bold uppercase tracking-widest text-[var(--text-primary)]">Restore</h1>
      </div>

      <div className="relative z-10 w-full max-w-lg ka-card p-8 sm:p-12 shadow-2xl flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] mb-1">
            <FiZap size={22} />
          </div>
          <div className="eyebrow-badge mb-1">Access Recovery</div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--text-primary)]">Password Recovery</h2>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed font-normal">
            Enter your registered email address and we will transmit a password reset link to your account.
          </p>
        </div>

        <form onSubmit={SubmitHandler} className="flex flex-col gap-6">
          <label>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)] mb-2 block">Registered Email</span>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input
                required
                type="email"
                name="Email"
                placeholder="you@example.com"
                value={formData.Email}
                onChange={(e) => setFormData({ Email: e.target.value })}
                className="ka-input pl-11"
              />
            </div>
          </label>

          <button type="submit" className="btn-primary w-full text-sm">
            <span>Send Reset Link</span>
          </button>
        </form>

        <Link to="/login" className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <FiArrowLeft size={14} /> Back to Login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;