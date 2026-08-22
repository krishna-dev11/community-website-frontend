import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../Components/Core/DashBoard/LeftPart/SideBar'
import { HiMenuAlt2 } from "react-icons/hi";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='relative flex w-full h-screen bg-[var(--bg)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300'>
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className='md:hidden translate-y-10 -translate-x-3 fixed top-5 left-5 z-40 p-2.5 bg-[var(--surface-elevated)] border border-[var(--border-subtle)] rounded-2xl text-[var(--accent-primary)] active:scale-95 transition-all shadow-lg cursor-pointer'
        aria-label="Open sidebar"
      >
        <HiMenuAlt2 size={22} />
      </button>

      <SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className='flex-1 h-full border-l border-[var(--border-subtle)] bg-[var(--bg)] overflow-auto custom-scrollbar'>
        <div className='mx-auto px-4 md:px-10 py-[50px] max-w-7xl'>
          <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard