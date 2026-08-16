import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";

export default function Upload({ name, label, register, setValue, errors, video = false, viewData = null }) {
  const [previewSource, setPreviewSource] = useState("");

  useEffect(() => {
    if (viewData) {
      setPreviewSource(viewData);
    }
  }, [viewData]);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => setPreviewSource(reader.result);
      setValue(name, file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: !video ? { "image/*": [".jpeg", ".jpg", ".png"] } : { "video/*": [".mp4"] },
    onDrop,
  });

  return (
    <div className="flex flex-col gap-2">
      <div 
        {...getRootProps()} 
        className={`relative min-h-[220px] rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden
          ${isDragActive ? "border-[#10b981] bg-[#10b981]/5 shadow-[inset_0_0_30px_rgba(16,185,129,0.1)]" : "border-[#ffffff]/5 bg-[#ffffff]/[0.01] hover:bg-[#ffffff]/0.03]"}
        `}
      >
        <input {...getInputProps()} />
        
        {previewSource ? (
          <div className="relative w-full h-full p-4 flex flex-col items-center">
              
              {!video ? (
                <img src={previewSource} className="w-full h-[180px] object-cover rounded-2xl border border-[#ffffff]/10" alt="Preview" />
              ) : (
                <div className="text-[#ffffff] text-xs font-bold uppercase tracking-widest">Video Node Loaded</div>
              )}
              
              <div 
                className="absolute top-6 right-6 p-2 bg-[#000000]/80 rounded-lg text-[#ef4444] hover:scale-110 transition-all z-20" 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setPreviewSource(""); 
                  setValue(name, null); 
                }}
              >
                <FiTrash2 />
              </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 rounded-2xl bg-[#ffffff]/5 flex items-center justify-center border border-[#ffffff]/10 shadow-2xl">
               <FiUploadCloud className="text-[#10b981] text-3xl" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b7280]">Initialize Visual Asset</p>
          </div>
        )}
      </div>
      {errors[name] && <span className="text-[10px] text-[#ef4444] font-bold uppercase tracking-tighter ml-1">Asset Protocol Mandatory</span>}
    </div>
  );
}