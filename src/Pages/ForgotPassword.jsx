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
    <div className="relative min-h-screen w-full bg-[#000] flex justify-center items-center font-sans overflow-hidden">
      <div className="absolute top-[10%] left-[-5%] select-none pointer-events-none opacity-[0.02] z-0">
        <h1 className="text-[18rem] font-bold uppercase tracking-widest">Restore</h1>
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white/[0.02] border border-white/10 p-12 rounded-[3rem] backdrop-blur-3xl shadow-3xl flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400 mb-2">
            <FiZap />
          </div>
          <h2 className="text-4xl font-bold tracking-tighter text-white">Access Recovery</h2>
          <p className="text-gray-500 text-sm leading-relaxed font-light">
            Initialize the security handshake. We will transmit a restoration link to your registered communication node.
          </p>
        </div>

        <form onSubmit={SubmitHandler} className="flex flex-col gap-8">
          <label>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-600 mb-2 block ml-1">Email Node Address</span>
            <div className="relative group">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 group-focus-within:text-emerald-400 transition-colors" />
              <input
                required type="email" name="Email"
                placeholder="node@academy.com"
                value={formData.Email}
                onChange={(e) => setFormData({Email: e.target.value})}
                className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white text-sm focus:border-emerald-500/30 outline-none transition-all placeholder-gray-800 shadow-inner"
              />
            </div>
          </label>

          <button type="submit" className="w-full py-5 bg-white text-black font-bold rounded-2xl uppercase tracking-widest text-[10px] shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:bg-gray-200 transition-all active:scale-95">
            Transmit Restoration Link
          </button>
        </form>

        <Link to="/" className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all">
          <FiArrowLeft /> Back to Login Terminal
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;