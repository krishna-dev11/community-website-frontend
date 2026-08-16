

        

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SlideBarButton from "./SlideBarButton";
import { sidebarLinks } from "../../../../data/dashboard-links";
import { IoIosLogOut } from "react-icons/io";
import ConfirmationModal from "../../../Common/ConfirmationModal";
import { setLogOut } from "../../../../services/Operations/authAPI";

const SideBar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { loading: authLoading } = useSelector((state) => state.auth);
  const { loading: profileLoading, user } = useSelector((state) => state.profile);
  const [logOutModal, setLogOutModal] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (authLoading || profileLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userRole = user?.accountType;

  return (
    <>
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      
      
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        w-[75px] md:w-[18%] md:min-w-[240px] 
        h-screen bg-[#050505] border-r border-white/5 flex flex-col transition-all duration-500 ease-in-out
      `}>
        
        <div className="absolute bottom-[-10%] left-[-20%] w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />

        
        <div className="flex flex-col text-white translate-y-14 gap-y-4 flex-1 px-2 md:px-4 overflow-y-auto custom-scrollbar">
          {sidebarLinks.map((section, i) => {
            if (section.roles && !section.roles.includes(userRole)) return null;

            return (
              <div key={i} className="flex flex-col gap-y-3">
                
                <p className="hidden md:block text-gray-600 text-[10px] font-bold tracking-[0.2em] uppercase px-4">
                  {section.section}
                </p>

                <div className="flex flex-col">
                  {section.links.map((link, index) => (
                    <SlideBarButton
                      key={index}
                      icon={link.icon}
                      path={link.path}
                      name={link.name}
                      onClick={() => setIsSidebarOpen(false)} // Mobile click par menu close
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        
        <div className="mt-auto p-2 md:p-4 flex text-white flex-col gap-y-2 border-t border-white/5 bg-white/[0.01] backdrop-blur-md">
          <SlideBarButton
            icon="IoMdSettings"
            path="/dashboard/setting"
            name="Account Settings"
            onClick={() => setIsSidebarOpen(false)}
          />

          <button
            className="flex items-center justify-center md:justify-start gap-x-3 text-gray-500 text-sm font-bold px-4 py-3 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
            onClick={() => {
              setIsSidebarOpen(false);
              setLogOutModal({
                heading: "Confirm Logout?",
                text1: "You will need to login again to access your dashboard.",
                button1Text: "Logout",
                button2Text: "Cancel",
                btn1Onclick: () => dispatch(setLogOut(navigate)),
                btn2Onclick: () => setLogOutModal(null),
              })
            }}
          >
            <IoIosLogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden md:block uppercase tracking-widest text-[11px]">Logout</span>
          </button>
        </div>
      </div>

      {logOutModal && <ConfirmationModal data={logOutModal} />}
    </>
  );
};

export default SideBar;