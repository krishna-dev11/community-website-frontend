import React, { useState, useRef, useEffect } from "react";
import { FiUploadCloud, FiImage, FiFileText, FiTrash2, FiCheck, FiAlertCircle } from "react-icons/fi";
import toast from "react-hot-toast";
import { compressImage, CompressionPresets } from "../../Utilities/imageCompressor";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const FileUploadWithPreview = ({
  label,
  file,
  onFileSelect,
  accept = "image/jpeg,image/png,image/webp",
  maxSizeMB = 10,
  required = false,
  helperText,
  existingUrl = null,
  id,
  isDocument = false,
}) => {
  const [preview, setPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (file instanceof File) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    } else if (existingUrl) {
      setPreview(existingUrl);
    } else {
      setPreview(null);
    }
  }, [file, existingUrl]);

  const validateAndSet = async (selectedFile) => {
    if (!selectedFile) return;

    // Check size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      toast.error(`File size exceeds limit (${maxSizeMB}MB max)`);
      return;
    }

    // Check MIME if accept is specified
    if (accept) {
      const acceptedList = accept.split(",").map((t) => t.trim().toLowerCase());
      const fileType = (selectedFile.type || "").toLowerCase();
      const fileExt = `.${(selectedFile.name || "").split(".").pop().toLowerCase()}`;

      const isValid = acceptedList.some(
        (rule) =>
          rule === fileType ||
          rule === fileExt ||
          (rule.endsWith("/*") && fileType.startsWith(rule.replace("/*", "")))
      );

      if (!isValid && selectedFile.type) {
        toast.error(`Unsupported format. Allowed: ${accept}`);
        return;
      }
    }

    // If it's an image, apply intelligent client-side optimization
    if (selectedFile.type && selectedFile.type.startsWith("image/")) {
      try {
        setIsCompressing(true);
        const preset = isDocument ? CompressionPresets.DOCUMENT : CompressionPresets.PHOTO;
        const optimizedFile = await compressImage(selectedFile, preset);
        onFileSelect(optimizedFile);
      } catch (err) {
        onFileSelect(selectedFile);
      } finally {
        setIsCompressing(false);
      }
    } else {
      // PDF or non-image, leave completely untouched
      onFileSelect(selectedFile);
    }
  };

  const handleChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndSet(selected);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      validateAndSet(dropped);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onFileSelect(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const inputId = id || `file-upload-${label?.toLowerCase().replace(/\s+/g, "-") || "input"}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-white/60">
          <span>
            {label} {required && <span className="text-emerald-400">*</span>}
          </span>
          {helperText && <span className="text-[10px] font-normal text-white/40">{helperText}</span>}
        </label>
      )}

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      {file || preview ? (
        <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 transition-all hover:border-emerald-500/50">
          <div className="flex items-center gap-3.5">
            {preview ? (
              <img
                src={preview}
                alt="Upload preview"
                className="h-16 w-16 shrink-0 rounded-lg border border-emerald-500/40 object-cover shadow-md"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                <FiFileText size={24} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {file?.name || "Attached Document / Photo"}
              </p>
              {file?.size && (
                <p className="text-xs text-white/50">{formatFileSize(file.size)}</p>
              )}
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  <FiCheck size={10} /> Ready
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-white/70 underline transition hover:text-white"
                >
                  Change
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              title="Remove file"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all ${
            isDragOver
              ? "border-emerald-400 bg-emerald-500/10"
              : "border-white/15 bg-white/[0.02] hover:border-emerald-400/50 hover:bg-white/[0.04]"
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition group-hover:border-emerald-400/40 group-hover:bg-emerald-400/10 group-hover:text-emerald-300">
            <FiUploadCloud size={20} />
          </div>
          <p className="mt-2.5 text-xs font-bold uppercase tracking-wider text-white/80 group-hover:text-white">
            Choose file <span className="font-normal text-white/40">or drag & drop</span>
          </p>
          <p className="mt-1 text-[10px] text-white/40">
            JPG, PNG, WEBP up to {maxSizeMB}MB
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadWithPreview;
