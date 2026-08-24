import React, { useEffect } from "react";
import { FiX, FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";

const DocViewer = ({ isOpen, onClose, url, title = "Document Viewer" }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !url) return null;

  const isPdf =
    url.toLowerCase().endsWith(".pdf") ||
    url.toLowerCase().includes(".pdf?") ||
    url.includes("/raw/upload/") ||
    url.toLowerCase().includes("application/pdf");

  const isImage =
    url.match(/\.(jpeg|jpg|png|webp|gif|svg)(\?.*)?$/i) ||
    (!isPdf && !url.includes("raw"));

  const getDownloadUrl = () => {
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/fl_attachment/");
    }
    return url;
  };

  const handleDownload = () => {
    const downloadUrl = getDownloadUrl();
    const cleanTitle = (title || "Document").replace(/[^a-zA-Z0-9_-]/g, "_");
    const ext = isPdf ? ".pdf" : ".jpg";
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = cleanTitle.endsWith(ext) ? cleanTitle : `${cleanTitle}${ext}`;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/85 p-2 sm:p-4 md:p-6 backdrop-blur-md">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] ka-card border border-[var(--border-strong)] shadow-[0_30px_90px_rgba(0,0,0,0.95)] overflow-hidden rounded-2xl">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-[var(--border-subtle)] px-4 py-3 sm:px-6 sm:py-4 bg-[var(--surface-elevated)] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              <FiFileText size={16} />
            </div>
            <div className="min-w-0">
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                {title}
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] truncate">
                {isPdf ? "PDF Document" : "Image / Certificate"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              title="Download File"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 text-[11px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)]/40 hover:text-[var(--text-primary)] cursor-pointer"
            >
              <FiDownload size={13} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] px-2.5 text-[11px] font-bold text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)]/40 hover:text-[var(--text-primary)] cursor-pointer"
            >
              <FiExternalLink size={13} />
              <span className="hidden sm:inline">New Tab</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              title="Close Viewer"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div className="flex-1 w-full overflow-y-auto overflow-x-auto p-2 sm:p-4 bg-black/40 flex items-center justify-center min-h-[50vh] max-h-[calc(92vh-70px)]">
          {isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[65vh]">
              <iframe
                src={`${url}#toolbar=1&navpanes=1`}
                title={title}
                className="w-full h-full min-h-[65vh] rounded-xl border border-white/10 bg-white"
              />
            </div>
          ) : isImage ? (
            <div className="w-full h-full flex items-center justify-center py-2">
              <img
                src={url}
                alt={title}
                className="max-h-[75vh] max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
              />
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center min-h-[65vh]">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`}
                title={title}
                className="w-full h-full min-h-[65vh] rounded-xl border border-white/10 bg-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocViewer;
