
      

      

import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../Components/Core/DashBoard/LeftPart/SideBar'
import { HiMenuAlt2 } from "react-icons/hi"; // Professional Hamburger Icon

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='relative  flex w-full h-screen bg-black overflow-hidden'>
      
      
      
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className='md:hidden translate-y-10 -translate-x-3 fixed top-5 left-5 z-40 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 active:scale-95 transition-all shadow-lg shadow-black/50'
      >
        <HiMenuAlt2 size={24} />
      </button>

      
      <SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      
      
      <div className='flex-1 h-full border-l border-white/5 bg-black overflow-auto custom-scrollbar'>
          <div className='mx-auto px-4 md:px-10 py-[50px]'>
             <Outlet/>
          </div>
      </div>
      
    </div>
  )
}

export default Dashboard