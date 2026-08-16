import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp, signUp } from "../services/Operations/authAPI";
import { useNavigate } from "react-router-dom";
import OtpInput from "react-otp-input";
import { FiShield, FiRefreshCw } from "react-icons/fi";
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
    const { FirstName, lastName, CreatePassword, ConfirmPassword, EmailAddress, accountType } = signUpData;
    dispatch(signUp(FirstName, lastName, EmailAddress, CreatePassword, ConfirmPassword, accountType, otp, navigate));
  };

  return (
    <div className="relative min-h-screen w-full bg-[#000] flex justify-center items-center font-sans overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md bg-white/[0.02] border border-white/10 p-12 rounded-[3rem] backdrop-blur-3xl shadow-3xl text-center flex flex-col gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <FiShield size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">Identity Sync</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Verification Code Transmitted</p>
          </div>
        </div>

        <form onSubmit={submitHandler} className="flex flex-col gap-10">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderSeparator={<span className="mx-2 text-gray-800">-</span>}
            renderInput={(props) => (
              <input
                {...props}
                className="!w-12 lg:!w-14 h-16 bg-white/[0.03] border border-white/5 rounded-2xl text-2xl font-bold text-emerald-400 text-center focus:border-emerald-500/40 outline-none transition-all shadow-inner"
              />
            )}
          />

          <div className="flex flex-col gap-6">
            <button type="submit" className="w-full py-5 bg-white text-black font-bold rounded-2xl uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-all shadow-[0_0_50px_rgba(255,255,255,0.15)] active:scale-95">
              Authorize Access
            </button>

            <div className="flex items-center justify-center gap-3">
              {canResend ? (
                <button type="button" onClick={() => dispatch(sendOtp(signUpData.EmailAddress, navigate))} className="flex items-center gap-2 text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
                  <FiRefreshCw /> Resend Protocol
                </button>
              ) : (
                <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">Retry Available in {timer}s</span>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnterOtp;
