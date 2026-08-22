import React from "react";
import { FiArrowLeft, FiAlertTriangle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] flex flex-col items-center justify-center font-sans overflow-hidden px-6 transition-colors duration-300">
      {/* Background Big Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0">
        <h1 className="text-[15rem] md:text-[24rem] font-black text-[var(--text-primary)]/[0.03] tracking-tighter leading-none font-display">
          404
        </h1>
      </div>

      {/* Subtle Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-[var(--accent-purple)]/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[var(--accent-primary)]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-md mx-auto">
        <div className="relative">
          <div className="absolute -inset-4 bg-[var(--accent-primary)]/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-[var(--surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-primary)] shadow-2xl backdrop-blur-md">
            <FiAlertTriangle size={36} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="eyebrow-badge mx-auto">
            Page Not Found
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[var(--text-primary)] font-heading">
            Lost in <span className="text-gradient">Space</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm md:text-base font-normal leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 mt-2">
          <button
            onClick={() => navigate("/")}
            className="btn-primary !py-3 !px-7 flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <FiArrowLeft size={16} />
            <span>Return to Homepage</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
