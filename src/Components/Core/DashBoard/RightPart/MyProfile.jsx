import React, { useState } from "react";
import { useSelector } from "react-redux";
import { FiEdit3, FiCreditCard, FiUser, FiMapPin, FiBriefcase, FiBookOpen, FiUsers, FiShield } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import MembershipCardModal from "../../../Common/MembershipCardModal";
import MyContributionsModal from "../../../Common/MyContributionsModal";

const ProfileSection = ({ icon: Icon, title, children, onEdit }) => (
  <div className="ka-card p-6 md:p-8">
    <div className="flex justify-between items-center mb-6 border-b border-[var(--border-subtle)] pb-4">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center">
            <Icon size={16} />
          </div>
        )}
        <h3 className="text-lg md:text-xl font-bold text-[var(--text-primary)] tracking-tight">{title}</h3>
      </div>
      {onEdit && (
        <button 
          onClick={onEdit}
          className="btn-secondary !py-1.5 !px-4 !text-xs"
        >
          <FiEdit3 size={13} />
          <span>Edit</span>
        </button>
      )}
    </div>
    {children}
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className="flex flex-col gap-1">
    <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-[0.18em]">{label}</p>
    <p className="text-[var(--text-primary)] text-sm md:text-base font-semibold break-words">
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

  const details = user?.additionalDetails || {};

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
          <h2 className="heading-hero text-[var(--text-primary)]">Member <span className="text-gradient">Profile</span></h2>
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
              <p className="text-2xl md:text-3xl font-black text-[var(--text-primary)] capitalize">
                {user?.firstName} {details?.middleName ? `${details.middleName} ` : ""}{user?.lastName}
              </p>
              <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-0.5">{user?.email}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="inline-block px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[10px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">
                  {user?.accountStatus || "ACTIVE"}
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

        {/* Section 1: Personal Information */}
        <ProfileSection icon={FiUser} title="Personal Information" onEdit={handleEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem label="First Name" value={user?.firstName} />
            <DetailItem label="Middle Name" value={details?.middleName} />
            <DetailItem label="Last Name" value={user?.lastName} />
            <DetailItem label="Gender" value={details?.gender} />
            <DetailItem label="Date of Birth" value={details?.dateOfBirth} />
            <DetailItem label="Gotra" value={details?.gotra} />
          </div>
        </ProfileSection>

        {/* Section 2: Contact Information */}
        <ProfileSection icon={FiShield} title="Contact Information" onEdit={handleEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Email Address" value={user?.email} />
            <DetailItem label="Contact / Mobile" value={details?.contactNumber} />
          </div>
        </ProfileSection>

        {/* Section 3: Address & Native Roots */}
        <ProfileSection icon={FiMapPin} title="Address & Native Roots" onEdit={handleEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Native Place / Mool Niwas" value={details?.nativePlace} />
            <DetailItem label="Current City" value={details?.currentCity} />
            <div className="sm:col-span-2">
              <DetailItem label="Residential Address" value={details?.address} />
            </div>
          </div>
        </ProfileSection>

        {/* Section 4: Education & Profession */}
        <ProfileSection icon={FiBriefcase} title="Education & Profession" onEdit={handleEdit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Highest Education" value={details?.education} />
            <DetailItem label="Profession / Occupation" value={details?.profession} />
          </div>
        </ProfileSection>

        {/* Section 5: Community & Samaj Info */}
        <ProfileSection icon={FiUsers} title="Samaj & Membership Record" onEdit={null}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-6">
            <DetailItem label="Membership ID" value={user?._id ? `SMJ-${String(user._id).slice(-6).toUpperCase()}` : "Pending"} />
            <DetailItem label="Membership Status" value={user?.accountStatus || "ACTIVE"} />
            <DetailItem label="Account Type" value={user?.accountType || "Member"} />
            <DetailItem label="Registration Date" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }) : "N/A"} />
            {user?.family && (
              <DetailItem label="Family Record" value={user.family.familyName || "Connected"} />
            )}
          </div>
        </ProfileSection>

        {/* Section 6: Bio & About */}
        <ProfileSection icon={FiBookOpen} title="Bio & About" onEdit={handleEdit}>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm md:text-base italic font-normal">
            {details?.about || "No bio provided yet. Click Edit to add details about yourself."}
          </p>
        </ProfileSection>

      </div>
    </div>
  );
};

export default MyProfile;