

import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiUpload } from "react-icons/fi";
import { updateDisplayPicture } from "../../../../../services/Operations/DashBoard";

const UpdateProfilePicture = () => {
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(false);
  const [previewSource, setPreviewSource] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const changeHandler = (e) => {
    const file = e.target.files[0];
    if (file) { setImageFile(file); previewFile(file); }
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
    <div className="bg-white/[0.02] border border-white/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] backdrop-blur-xl flex flex-col md:flex-row items-center gap-6 md:gap-8 shadow-2xl transition-all hover:bg-white/[0.04]">
      <div className="relative">
        {loading && (
          <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-emerald-500 to-blue-500 animate-spin blur-[2px]"></div>
        )}
        <img
          src={previewSource || user?.imageUrl}
          className="relative w-24 h-24 rounded-full object-cover border-2 border-white/10 shadow-lg"
          alt="Profile"
        />
      </div>

      <div className="flex flex-col items-center md:items-start gap-4 w-full">
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-gray-400">Profile Media Node</p>
        
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-3 md:gap-4 w-full md:w-auto">
          <input type="file" ref={fileInputRef} onChange={changeHandler} className="hidden" />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="px-4 md:px-6 py-3 md:py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all text-white"
          >
            Select Image
          </button>
          <button 
            onClick={handleFileUpload}
            disabled={!imageFile}
            className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-2.5 bg-white text-black rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-gray-200 disabled:opacity-30 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <FiUpload /> {loading ? "Uploading..." : "Sync Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfilePicture;