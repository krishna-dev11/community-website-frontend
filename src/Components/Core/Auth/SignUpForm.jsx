import React, { useState } from "react";
import { FiEye, FiEyeOff, FiGithub, FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setSignUpData } from "../../../Slices/Auth";
import { sendOtp, setGoogleLogin } from "../../../services/Operations/authAPI";
import { setUser } from "../../../Slices/Profile";
import { GoogleLogin } from "@react-oauth/google";
import Tab from "../../Common/Tab";
import { ACCOUNT_TYPE, TabData } from "../../../Utilities/Constaints";

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    FirstName: "",
    lastName: "",
    CreatePassword: "",
    ConfirmPassword: "",
    EmailAddress: "",
  });

  const [showCreatepassword, setShowCreatepassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [accountType, setAccountType] = useState(ACCOUNT_TYPE.STUDENT);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const SubmitHandler = async (event) => {
    event.preventDefault();
    if (formData.ConfirmPassword !== formData.CreatePassword) {
      toast.error("Passwords do not match");
      return;
    }
    const data = {
      ...formData,
      EmailAddress: formData.EmailAddress.trim().toLowerCase(),
      accountType,
    };
    const otpSent = await dispatch(sendOtp(data.EmailAddress, navigate));

    if (otpSent) {
      dispatch(setSignUpData(data));
      dispatch(setUser(data));
      navigate("/enterOtp");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!accountType) {
      toast.error("Please select account type first");
      return;
    }
    dispatch(setGoogleLogin(credentialResponse.credential, accountType, navigate));
  };

  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] ml-1 mb-1.5 block";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000000] p-4 md:p-10 font-sans">
      
      
      
      <div className="w-full lg:w-[90%] max-w-6xl h-auto lg:h-[85vh] bg-[#0a0a0a] rounded-[2.5rem] lg:rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row border border-[#ffffff]/5">

        
        
        <div className="hidden md:flex w-full lg:w-1/2 bg-gradient-to-br from-[#1a0b2e] via-[#000000] to-[#0a0a0a] p-10 lg:p-14 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#ffffff]/5">
          <div className="absolute top-[-5%] left-[-5%] w-48 h-48 bg-[#6A0DAD]/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-48 h-48 bg-[#10b981]/5 blur-[80px] rounded-full" />

          <div className="relative z-10 space-y-6 lg:space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6A0DAD]/20 flex items-center justify-center border border-[#6A0DAD]/30 shadow-lg shrink-0">
                <span className="text-[#ffffff] font-black text-lg">V</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffffff]">Bold Voive</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#10b981]/80">Spoken English</span>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-[#ffffff] text-3xl lg:text-5xl font-bold tracking-tighter leading-tight">
                Master Your <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A0DAD] to-[#a78bfa]">Elite Fluency</span>
              </h1>
              <p className="text-[#9ca3af] text-sm font-light leading-relaxed max-w-[300px]">
                Join the league of confident speakers. Refine your persona today.
              </p>
            </div>

            <div className="flex flex-col gap-y-5 pt-2">
              {[{s: "01", t: "Identity Sync"}, {s: "02", t: "Goal Discovery"}, {s: "03", t: "Node Activation"}].map((step, i) => (
                <div key={i} className={`flex items-center gap-4 ${i > 0 && "opacity-30"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] ${i === 0 ? "bg-[#ffffff] text-[#000000]" : "border border-[#4b5563] text-[#4b5563]"}`}>
                    {step.s}
                  </div>
                  <p className="text-[#ffffff] text-[10px] font-bold uppercase tracking-widest">{step.t}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        
<div className="w-full lg:w-1/2 bg-[#000000] p-6 lg:p-10 flex flex-col justify-center lg:overflow-hidden">
  
  
  <div className="mb-4 lg:mb-6">
    <h2 className="text-xl lg:text-2xl font-bold text-[#ffffff] tracking-tight text-center lg:text-left uppercase">
      Register Candidate
    </h2>
    <p className="text-[#6b7280] text-[11px] mt-1 font-light text-center lg:text-left">
      Initiate your transformation protocol.
    </p>
  </div>

  
  <div className="mb-4 flex justify-center lg:justify-start transform scale-90 origin-left">
     <Tab tabData={TabData} accountType={accountType} setaccountType={setAccountType} />
  </div>

  <form onSubmit={SubmitHandler} className="flex flex-col gap-3">
    
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <label>
        <span className={labelStyle}>First Name</span>
        <div className="relative group">
          <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4b5563] group-focus-within:text-[#10b981] text-xs" />
          <input 
            required name="FirstName" type="text" placeholder="John" 
            value={formData.FirstName} onChange={changeHandler} 
            className="w-full bg-[#1A1A1A] border border-[#ffffff]/5 rounded-lg px-10 py-2.5 text-[#ffffff] placeholder-[#4b5563] focus:border-[#10b981]/30 outline-none transition-all text-xs" 
          />
        </div>
      </label>
      <label>
        <span className={labelStyle}>Last Name</span>
        <input 
          required name="lastName" type="text" placeholder="Doe" 
          value={formData.lastName} onChange={changeHandler} 
          className="w-full bg-[#1A1A1A] border border-[#ffffff]/5 rounded-lg px-4 py-2.5 text-[#ffffff] placeholder-[#4b5563] focus:border-[#10b981]/30 outline-none transition-all text-xs" 
        />
      </label>
    </div>

    
    <label>
      <span className={labelStyle}>Communication Node (Email)</span>
      <div className="relative group">
        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4b5563] group-focus-within:text-[#10b981] text-xs" />
        <input 
          required name="EmailAddress" type="email" placeholder="candidate@email.com" 
          value={formData.EmailAddress} onChange={changeHandler} 
          className="w-full bg-[#1A1A1A] border border-[#ffffff]/5 rounded-lg px-10 py-2.5 text-[#ffffff] placeholder-[#4b5563] focus:border-[#10b981]/30 outline-none transition-all text-xs" 
        />
      </div>
    </label>

    
    <div className="grid grid-cols-2 gap-3">
      <label className="relative">
        <span className={labelStyle}>Create Pass</span>
        <div className="relative group">
          <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4b5563] text-xs" />
          <input 
            required name="CreatePassword" type={showCreatepassword ? "text" : "password"} 
            placeholder="••••" value={formData.CreatePassword} onChange={changeHandler} 
            className="w-full bg-[#1A1A1A] border border-[#ffffff]/5 rounded-lg px-10 py-2.5 text-[#ffffff] outline-none text-xs" 
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-[#4b5563]" onClick={() => setShowCreatepassword(!showCreatepassword)}>
            {showCreatepassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
          </span>
        </div>
      </label>
      <label className="relative">
        <span className={labelStyle}>Confirm Pass</span>
        <input 
          required name="ConfirmPassword" type={showConfirmPassword ? "text" : "password"} 
          placeholder="••••" value={formData.ConfirmPassword} onChange={changeHandler} 
          className="w-full bg-[#1A1A1A] border border-[#ffffff]/5 rounded-lg px-4 py-2.5 text-[#ffffff] outline-none text-xs" 
        />
      </label>
    </div>

    
    <button type="submit" className="w-full bg-[#ffffff] text-[#000000] font-bold py-3 rounded-xl mt-2 uppercase tracking-[0.2em] text-[9px] shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-[#10b981] transition-all active:scale-95 flex items-center justify-center gap-2">
      Sync Account <FiArrowRight size={14} />
    </button>

    
    <div className="flex flex-col gap-3 mt-2">
      <div className="flex items-center gap-3">
        <div className="h-[1px] bg-[#ffffff]/5 flex-1" />
        <span className="text-[8px] font-bold text-[#4b5563] uppercase tracking-widest">Handshake</span>
        <div className="h-[1px] bg-[#ffffff]/5 flex-1" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 bg-[#ffffff]/[0.03] border border-[#ffffff]/5 py-1 rounded-lg flex justify-center scale-90 origin-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Sync Failed")} />
        </div>
        <button type="button" className="flex-1 bg-[#ffffff]/[0.03] border border-[#ffffff]/5 rounded-lg text-[#ffffff] text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ffffff]/5 transition-all">
           Github
        </button>
      </div>
    </div>

    <p className="text-[#4b5563] text-center text-[9px] font-bold uppercase tracking-widest mt-2">
      Already verified? <Link to="/login" className="text-[#ffffff] hover:text-[#10b981] transition-colors ml-1">Access Terminal</Link>
    </p>
  </form>
</div>
      </div>
    </div>
  );
};

export default SignUpForm;
