import  { useState } from "react";
import { FiEye, FiEyeOff, FiGithub, FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { ACCOUNT_TYPE } from "../../../Utilities/Constaints";
import { useDispatch } from "react-redux";
import { setGoogleLogin, setLogin } from "../../../services/Operations/authAPI";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    EmailAddress: "",
    Password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [accountType] = useState(ACCOUNT_TYPE.STUDENT);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const changeHandler = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const SubmitHandler = (event) => {
    event.preventDefault();
    dispatch(setLogin(formData.EmailAddress, formData.Password, navigate));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    dispatch(setGoogleLogin(credentialResponse.credential, accountType, navigate));
  };

  const inputStyle = "w-full bg-[#ffffff]/[0.03] border border-[#ffffff]/5 rounded-2xl px-5 py-4 text-[#ffffff] placeholder-[#4b5563] focus:border-[#10b981]/30 outline-none transition-all text-sm";
  const labelStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-[#6b7280] ml-1 mb-2 block";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#000000] p-4 md:p-8 font-sans">
      
      
      <div className="w-full lg:w-[85%] max-w-6xl min-h-[85vh] bg-[#0a0a0a] rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col lg:flex-row border border-[#ffffff]/5">

        
        
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#1a0b2e] via-[#000000] to-[#0a0a0a] p-8 md:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#ffffff]/5">
          
          <div className="absolute top-[-5%] left-[-5%] w-48 h-48 bg-[#6A0DAD]/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-[-5%] right-[-5%] w-48 h-48 bg-[#10b981]/5 blur-[80px] rounded-full" />

          <div className="relative z-10 space-y-6 md:space-y-8">
            
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
              <h1 className="text-[#ffffff] text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter leading-tight">
                Continue Your <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6A0DAD] to-[#a78bfa]">Persona Evolution</span>
              </h1>
              <p className="text-[#9ca3af] text-sm font-light leading-relaxed max-w-[320px]">
                Access your training modules and synchronize with your learning node.
              </p>
            </div>

            
            <div className="hidden sm:flex flex-col gap-y-5 pt-2">
              {[
                { step: "01", label: "Access Handshake", active: true },
                { step: "02", label: "Node Synchronization", active: false },
                { step: "03", label: "Terminal Entry", active: false }
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-4 ${!item.active && "opacity-30"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[9px] ${item.active ? "bg-[#ffffff] text-[#000000] shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "border border-[#4b5563] text-[#4b5563]"}`}>
                    {item.step}
                  </div>
                  <p className="text-[#ffffff] text-[10px] font-bold uppercase tracking-widest">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        
        <div className="w-full lg:w-1/2 bg-[#000000] p-8 md:p-12 lg:p-20 flex flex-col justify-center">
          <div className="mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#ffffff] tracking-tight">Access Terminal</h2>
            <p className="text-[#6b7280] text-sm mt-2 font-light">Enter your secure credentials to continue.</p>
          </div>

          <form onSubmit={SubmitHandler} className="flex flex-col gap-6">
            
            <label>
              <span className={labelStyle}>Communication Node (Email)</span>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5563] group-focus-within:text-[#10b981] transition-colors" />
                <input
                  required
                  type="email"
                  name="EmailAddress"
                  placeholder="eg. candidate@boldvoive.com"
                  value={formData.EmailAddress}
                  onChange={changeHandler}
                  className={`${inputStyle} pl-12`}
                />
              </div>
            </label>

            
            <div className="relative">
              <label className={labelStyle}>Security Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4b5563] group-focus-within:text-[#10b981]" />
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  name="Password"
                  placeholder="••••••••"
                  value={formData.Password}
                  onChange={changeHandler}
                  className={`${inputStyle} pl-12`}
                />
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#4b5563] hover:text-[#ffffff] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
              <Link to="/forgotPassword" className="text-[#3b82f6] text-[10px] font-bold uppercase tracking-widest absolute right-0 -bottom-6 hover:text-[#ffffff] transition-colors">
                Recover Access?
              </Link>
            </div>

            
            <button
              type="submit"
              className="w-full bg-[#ffffff] text-[#000000] font-bold py-4 rounded-2xl mt-4 uppercase tracking-[0.2em] text-[10px] shadow-[0_0_50px_rgba(255,255,255,0.1)] hover:bg-[#10b981] hover:shadow-[0_0_50px_rgba(16,185,129,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Authorize Session <FiArrowRight />
            </button>

            
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center gap-4">
                <div className="h-[1px] bg-[#ffffff]/5 flex-1" />
                <span className="text-[9px] font-bold text-[#4b5563] uppercase tracking-widest">External Handshake</span>
                <div className="h-[1px] bg-[#ffffff]/5 flex-1" />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-[#ffffff]/[0.03] border border-[#ffffff]/5 py-1.5 rounded-xl flex justify-center hover:bg-[#ffffff]/5 transition-all">
                  <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Handshake Failed")} />
                </div>
                <button type="button" className="flex-1 bg-[#ffffff]/[0.03] border border-[#ffffff]/5 py-4 rounded-xl text-[#ffffff] text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ffffff]/5 transition-all">
                  <FiGithub size={16} /> Github
                </button>
              </div>
            </div>

            <p className="text-[#4b5563] text-center text-[10px] font-bold uppercase tracking-widest mt-6">
              New Candidate? <Link to="/signup" className="text-[#ffffff] hover:text-[#10b981] transition-colors ml-1 border-b border-[#ffffff]/20">Register Node</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
