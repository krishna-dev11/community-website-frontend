import React from 'react'
import UpdateProfilePicture from './UpdateProfilePicture';
import UpdateProfile from './UpdateProfile';
import PasswordUpdate from './PasswordUpdate';
import DeleteAccount from './DeleteAccount';

const SettingIndex = () => {
  return (
    <div className="relative min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] p-2 md:p-6 overflow-x-hidden transition-colors duration-300">
      <div className="absolute top-[10%] left-[-5%] select-none pointer-events-none opacity-[0.02] z-0">
        <h1 className="text-[15rem] font-bold uppercase tracking-widest text-[var(--text-primary)]">Settings</h1>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
            <span>Home</span> <span className="text-[var(--accent-primary)]">/</span>
            <span>Dashboard</span> <span className="text-[var(--accent-primary)]">/</span>
            <span className="text-[var(--text-primary)]">Settings</span>
          </nav>
          <h2 className="heading-hero text-[var(--text-primary)]">Account <span className="text-gradient">Config</span></h2>
        </div>

        <div className="flex flex-col gap-6">
          <UpdateProfilePicture />
          <UpdateProfile />
          <PasswordUpdate />
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
}

export default SettingIndex;