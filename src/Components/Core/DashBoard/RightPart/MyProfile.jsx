import React from "react";
import { useSelector } from "react-redux";
import { FiEdit3 } from "react-icons/fi"; // Cleaner modern icon
import { useNavigate } from "react-router-dom";

const ProfileCard = ({ title, children, onEdit }) => (
  <div className="relative group bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl transition-all hover:bg-white/[0.04]">
    <div className="flex justify-between items-center mb-8">
      <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
      <button 
        onClick={onEdit}
        className="flex items-center gap-2 px-5 py-2 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
      >
        <FiEdit3 size={14} /> Edit
      </button>
    </div>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] ml-0.5">{label}</p>
    <p className="text-white text-sm md:text-base font-medium truncate">
      {value || <span className="text-gray-700 italic">Not Provided</span>}
    </p>
  </div>
);

const MyProfile = () => {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  const handleEdit = () => navigate("/dashboard/setting");

  return (
    <div className="relative min-h-screen w-full bg-black text-white overflow-hidden p-6 md:p-12 font-sans">
      
      
      <div className="absolute top-0 right-0   bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] select-none pointer-events-none opacity-[0.02]">
        <h1 className="text-[15rem] font-bold uppercase tracking-widest">Profile</h1>
      </div>

      <div className="relative z-10 translate-y-6 max-w-4xl mx-auto flex flex-col gap-10">
        
        
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>Home</span>
            <span className="text-emerald-500">/</span>
            <span>Dashboard</span>
            <span className="text-emerald-500">/</span>
            <span className="text-white">My Profile</span>
          </nav>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Personal Hub</h2>
        </div>

        
        <div className="bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full blur opacity-30"></div>
              <img 
                src={user?.imageUrl} 
                className="relative h-24 w-24 md:h-28 md:w-28 rounded-full border-2 border-white/10 object-cover" 
                alt="User Profile"
              />
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl md:text-3xl font-bold text-white capitalize">{user?.firstName} {user?.lastName}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                {user?.accountType} Account
              </div>
            </div>
          </div>
          <button 
            onClick={handleEdit}
            className="px-8 py-3 bg-white text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
          >
            Edit Profile
          </button>
        </div>

        
        <ProfileCard title="Bio & About" onEdit={handleEdit}>
          <p className="text-gray-400 leading-relaxed text-sm md:text-base italic">
            {user?.additionalDetails?.about || "Speak about yourself to let the world know who you are..."}
          </p>
        </ProfileCard>

        
        <ProfileCard title="Detailed Information" onEdit={handleEdit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <DetailItem label="First Name" value={user?.firstName} />
            <DetailItem label="Last Name" value={user?.lastName} />
            <DetailItem label="Email Address" value={user?.email} />
            <DetailItem label="Contact Number" value={user?.additionalDetails?.contactNumber} />
            <DetailItem label="Gender" value={user?.additionalDetails?.gender} />
            <DetailItem label="Date of Birth" value={user?.additionalDetails?.dateOfBirth} />
          </div>
        </ProfileCard>

      </div>
    </div>
  );
};

export default MyProfile;