import React from "react";
import { FiArrowLeft, FiAlertTriangle, FiZap } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-[#000000] flex flex-col items-center justify-center font-sans overflow-hidden px-6">
      
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0">
        <h1 className="text-[15rem] md:text-[25rem] font-bold text-[#ffffff]/[0.02] tracking-tighter leading-none">
          404
        </h1>
      </div>

      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#6A0DAD]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#10b981]/5 blur-[100px] rounded-full pointer-events-none" />

      
      <div className="relative z-10 flex flex-col items-center text-center gap-8 animate-fadeSlideUp">
        
        
        <div className="relative">
          <div className="absolute -inset-4 bg-[#ef4444]/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-[#ffffff]/[0.02] border border-[#ffffff]/10 flex items-center justify-center text-[#ef4444] shadow-2xl backdrop-blur-md">
            <FiAlertTriangle size={48} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#ef4444]">
            System Protocol Error
          </h2>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#ffffff]">
            Node Not Located
          </h1>
          <p className="text-[#6b7280] text-sm md:text-base font-light max-w-sm mx-auto leading-relaxed">
            The curriculum node you are attempting to access does not exist or has been moved to a new <span className="text-[#10b981] font-medium">Communication Tier</span>.
          </p>
        </div>

        
        <div className="flex flex-col items-center gap-6 mt-4">
          <button 
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 bg-[#ffffff] text-[#000000] px-8 py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:bg-[#10b981] transition-all active:scale-95"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Restore Connection
          </button>
          
          <div className="flex items-center gap-2 opacity-50">
            <FiZap className="text-[#4b5563]" size={12} />
            <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#4b5563]">
              Bold Voive Security Protocol v2.0
            </span>
          </div>
        </div>
      </div>

      
      <div className="absolute top-10 left-10 w-20 h-[1px] bg-[#ffffff]/5" />
      <div className="absolute top-10 left-10 h-20 w-[1px] bg-[#ffffff]/5" />
      <div className="absolute bottom-10 right-10 w-20 h-[1px] bg-[#ffffff]/5" />
      <div className="absolute bottom-10 right-10 h-20 w-[1px] bg-[#ffffff]/5" />
      
    </div>
  );
};

export default NotFound;
