import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FiEdit3, FiCreditCard } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import MembershipCardModal from "../../../Common/MembershipCardModal";
import MyContributionsModal from "../../../Common/MyContributionsModal";

const ProfileCard = ({ title, children, onEdit }) => (
  <div className="ka-card p-6 md:p-8">
    <div className="flex justify-between items-center mb-6 border-b border-[var(--border-subtle)] pb-4">
      <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
      <button 
        onClick={onEdit}
        className="btn-secondary !py-1.5 !px-4 !text-xs"
      >
        <FiEdit3 size={13} />
        <span>Edit</span>
      </button>
    </div>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.18em]">{label}</p>
    <p className="text-[var(--text-primary)] text-sm md:text-base font-semibold truncate">
      {value || <span className="text-[var(--text-muted)] italic font-normal">Not Provided</span>}
    </p>
  </div>
);

const MyProfile = () => {
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);

  const handleEdit = () => navigate("/dashboard/setting");

  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] overflow-hidden p-2 md:p-6 transition-colors duration-300">
      
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--accent-primary)]/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] left-[-10%] select-none pointer-events-none opacity-[0.02]">
        <h1 className="text-[15rem] font-bold uppercase tracking-widest text-[var(--text-primary)]">Profile</h1>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            <span>Home</span>
            <span className="text-[var(--accent-primary)]">/</span>
            <span>Dashboard</span>
            <span className="text-[var(--accent-primary)]">/</span>
            <span className="text-[var(--text-primary)]">My Profile</span>
          </nav>
          <h2 className="heading-hero text-[var(--text-primary)]">Personal <span className="text-gradient">Hub</span></h2>
        </div>

        {/* User Hero Card */}
        <div className="ka-card p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative group">
              <img 
                src={user?.imageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.firstName || "Member"}`} 
                className="h-24 w-24 md:h-28 md:w-28 rounded-3xl border-2 border-[var(--accent-primary)]/30 object-cover shadow-lg" 
                alt="User Profile"
              />
            </div>
            <div className="text-center md:text-left">
              <p className="text-2xl md:text-3xl font-black text-[var(--text-primary)] capitalize">{user?.firstName} {user?.lastName}</p>
              <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-0.5">{user?.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">
                  {user?.accountStatus || "ACTIVE"} Status
                </span>
                {user?.roles?.map((role, idx) => (
                  <span key={idx} className="inline-block px-2.5 py-0.5 rounded-full bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => setIsCardModalOpen(true)}
              className="btn-primary !py-2.5 !px-5 !text-xs"
            >
              <FiCreditCard size={14} />
              <span>Digital ID</span>
            </button>
            <button 
              onClick={() => setIsContribModalOpen(true)}
              className="btn-secondary !py-2.5 !px-4 !text-xs"
            >
              <FaRupeeSign size={12} />
              <span>My Dues</span>
            </button>
          </div>
        </div>

        <MembershipCardModal isOpen={isCardModalOpen} onClose={() => setIsCardModalOpen(false)} />
        <MyContributionsModal isOpen={isContribModalOpen} onClose={() => setIsContribModalOpen(false)} />

        <ProfileCard title="Bio & About" onEdit={handleEdit}>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base italic font-normal">
            {user?.additionalDetails?.about || "Speak about yourself to let the world know who you are..."}
          </p>
        </ProfileCard>

        <ProfileCard title="Detailed Information" onEdit={handleEdit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
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