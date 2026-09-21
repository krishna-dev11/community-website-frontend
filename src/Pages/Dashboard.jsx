import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../Components/Core/DashBoard/LeftPart/SideBar'
import { HiMenuAlt2 } from "react-icons/hi";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className='dashboard-shell relative flex w-full bg-[var(--bg)] text-[var(--text-primary)] overflow-hidden transition-colors duration-300'
      style={{ height: 'calc(100dvh - 64px)', marginTop: '64px' }}>

      {/* Mobile sticky header bar — replaces the floating hamburger */}
      <div className='md:hidden fixed left-0 right-0 z-30 flex items-center gap-3 px-4 py-2.5 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border-subtle)] shadow-sm'
        style={{ top: '64px' }}>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className='flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--accent-primary)] active:scale-95 transition-all shadow cursor-pointer'
          aria-label="Open dashboard menu"
        >
          <HiMenuAlt2 size={18} />
          <span className='text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]'>Dashboard Menu</span>
        </button>
      </div>

      <SideBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className='flex-1 h-full border-l border-[var(--border-subtle)] bg-[var(--bg)] overflow-y-auto custom-scrollbar'>
        <div className='mx-auto px-3 sm:px-6 md:px-10 pt-16 md:pt-10 pb-16 max-w-7xl'>
          <Outlet/>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
