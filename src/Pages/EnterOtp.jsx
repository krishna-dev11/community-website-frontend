import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, signUp } from "../services/Operations/authAPI";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { FiShield, FiRefreshCw, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const EnterOtp = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const { signUpData } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let interval;
    if (timer > 0) {
      setCanResend(false);
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!signUpData) {
      toast.error("Please complete signup first");
      navigate("/signup");
    }
  }, [navigate, signUpData]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!signUpData) return;
    dispatch(signUp(signUpData, otp, navigate));
  };

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] flex justify-center items-center px-4 py-16 transition-colors duration-300 overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-primary)]/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md ka-card p-8 sm:p-10 shadow-2xl text-center flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-primary)]/20 text-[var(--accent-primary)]">
            <FiShield size={28} />
          </div>
          <div>
            <p className="eyebrow-badge mb-2">Security Verification</p>
            <h2 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Email OTP</h2>
            <p className="text-[var(--text-secondary)] text-xs font-normal mt-1">Enter the 6-digit code sent to your email</p>
          </div>
        </div>

        <form onSubmit={submitHandler} className="flex flex-col gap-8">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderSeparator={<span className="mx-1.5 text-[var(--border-strong)]">-</span>}
            renderInput={(props) => (
              <input
                {...props}
                className="!w-11 sm:!w-12 h-14 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl text-xl font-bold text-[var(--accent-primary)] text-center focus:border-[var(--accent-primary)] outline-none transition-all shadow-inner"
              />
            )}
          />

          <div className="flex flex-col gap-4">
            <button type="submit" className="btn-primary w-full text-sm">
              <span>Submit & Complete Registration</span>
            </button>

            <div className="flex items-center justify-center gap-3 mt-2">
              {canResend ? (
                <button type="button" onClick={() => dispatch(sendOtp(signUpData.email))} className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer">
                  <FiRefreshCw /> Resend OTP
                </button>
              ) : (
                <span className="text-[var(--text-muted)] text-xs font-semibold tracking-wider">Resend in {timer}s</span>
              )}
            </div>
          </div>
        </form>

        <Link to="/signup" className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <FiArrowLeft size={14} /> Back to registration
        </Link>
      </div>
    </div>
  );
};

export default EnterOtp;
