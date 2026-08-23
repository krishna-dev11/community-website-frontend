import React from "react";
import { FiImage } from "react-icons/fi";

const ImageSkeleton = ({
  aspectRatio = "aspect-video",
  className = "",
  label = "Samaj Photo Placeholder",
  subLabel = "Community image will be uploaded here",
  rounded = "rounded-3xl",
}) => {
  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden border border-[var(--border-subtle)] bg-gradient-to-br from-[var(--surface-raised)] via-[var(--surface)] to-[var(--surface-elevated)] p-6 text-center ${aspectRatio} ${rounded} ${className}`}
    >
      {/* Shimmer sweep animation overlay */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2.5s_infinite] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none" />

      {/* Decorative corners */}
      <div className="absolute top-3 left-3 h-3 w-3 border-t-2 border-l-2 border-[var(--accent-primary)]/30 rounded-tl-sm" />
      <div className="absolute top-3 right-3 h-3 w-3 border-t-2 border-r-2 border-[var(--accent-primary)]/30 rounded-tr-sm" />
      <div className="absolute bottom-3 left-3 h-3 w-3 border-b-2 border-l-2 border-[var(--accent-primary)]/30 rounded-bl-sm" />
      <div className="absolute bottom-3 right-3 h-3 w-3 border-b-2 border-r-2 border-[var(--accent-primary)]/30 rounded-br-sm" />

      <div className="relative z-10 flex flex-col items-center gap-2.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--accent-primary)]/20 bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-inner">
          <FiImage size={22} className="animate-pulse" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
          {label}
        </p>
        {subLabel ? (
          <p className="max-w-[240px] text-[11px] text-[var(--text-muted)] font-normal">
            {subLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default ImageSkeleton;
