import React from 'react'
import UpdateProfilePicture from './UpdateProfilePicture';
import UpdateProfile from './UpdateProfile';
import PasswordUpdate from './PasswordUpdate';
import DeleteAccount from './DeleteAccount';

const SettingIndex = () => {
  return (
    <div className="relative min-h-screen w-full bg-[#000] text-white p-6 md:p-12 overflow-x-hidden font-sans">
      
      
      <div className="absolute top-[10%] left-[-5%] select-none pointer-events-none opacity-[0.02] z-0">
        <h1 className="text-[15rem] font-bold uppercase tracking-widest">Settings</h1>
      </div>

      <div className="relative z-10 translate-y-6 max-w-5xl mx-auto flex flex-col gap-10">
        
        <div className="flex flex-col gap-2">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <span>Home</span> <span className="text-emerald-500">/</span>
            <span>Dashboard</span> <span className="text-emerald-500">/</span>
            <span className="text-white">Settings</span>
          </nav>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Account Config</h2>
        </div>

        <div className="flex flex-col gap-8">
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