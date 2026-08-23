import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload, FiImage } from "react-icons/fi";
import { updateDisplayPicture } from "../../../../../services/Operations/DashBoard";
import { compressImage, CompressionPresets } from "../../../../../Utilities/imageCompressor";

const UpdateProfilePicture = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [previewSource, setPreviewSource] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const changeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const compressed = await compressImage(file, CompressionPresets.AVATAR);
      setImageFile(compressed);
      previewFile(compressed);
    }
  };

  const previewFile = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => setPreviewSource(reader.result);
  };

  const handleFileUpload = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("displayPicture", imageFile);
    dispatch(updateDisplayPicture(token, formData)).then(() => setLoading(false));
  };

  return (
    <div className="ka-card p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8">
      <div className="relative">
        {loading && (
          <div className="absolute -inset-1 rounded-3xl bg-[var(--accent-primary)]/40 animate-pulse blur-[2px]"></div>
        )}
        <img
          src={previewSource || user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || "Member"}`}
          className="relative w-24 h-24 rounded-3xl object-cover border-2 border-[var(--accent-primary)]/30 shadow-md"
          alt="Profile"
        />
      </div>

      <div className="flex flex-col items-center md:items-start gap-4 w-full">
        <div>
          <div className="eyebrow-badge mb-1">
            <FiImage size={12} />
            <span>Profile Media</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-normal">Upload a clear photo to represent your profile across the portal</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-3 w-full md:w-auto">
          <input type="file" ref={fileInputRef} onChange={changeHandler} className="hidden" accept="image/*" />
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="btn-secondary !py-2.5 !px-5 !text-xs cursor-pointer"
          >
            Select Image
          </button>
          <button 
            type="button"
            onClick={handleFileUpload}
            disabled={!imageFile || loading}
            className="btn-primary !py-2.5 !px-5 !text-xs cursor-pointer disabled:opacity-40"
          >
            <FiUpload size={14} />
            <span>{loading ? "Uploading..." : "Save Image"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePicture;