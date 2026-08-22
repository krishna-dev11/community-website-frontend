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
      <div className="flex justify-center items-center h-screen bg-[var(--bg)]">
        <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userAccountType = user?.accountType;
  const userRoles = user?.roles || [];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${isSidebarOpen ? "w-[270px]" : "w-[75px]"} md:w-[18%] md:min-w-[240px]
        h-[100dvh] bg-[var(--surface)] border-r border-[var(--border-subtle)] flex flex-col transition-all duration-300 ease-in-out
      `}>
        <div className="absolute bottom-[-10%] left-[-20%] w-[300px] h-[300px] bg-[var(--accent-primary)]/5 blur-[100px] rounded-full pointer-events-none" />

        {/* Scrollable Navigation Area - properly bounded with min-h-0 and generous bottom padding so Finance section is 100% visible */}
        <div className="flex flex-col text-[var(--text-primary)] pt-20 md:pt-4 pb-28 gap-y-5 flex-1 min-h-0 px-2.5 md:px-4 overflow-y-auto custom-scrollbar">
          {sidebarLinks.map((section, i) => {
            const accountAllowed = !section.accountTypes || section.accountTypes.includes(userAccountType);
            const roleAllowed = !section.roles || section.roles.some((role) => userRoles.includes(role) || role === userAccountType);
            if (!accountAllowed || !roleAllowed) return null;

            return (
              <div key={i} className="flex flex-col gap-y-1.5">
                <p className={`${isSidebarOpen ? "block" : "hidden"} md:block text-[var(--text-muted)] text-[10px] font-bold tracking-[0.2em] uppercase px-3 mb-1 select-none`}>
                  {section.section}
                </p>

                <div className="flex flex-col gap-1">
                  {section.links.map((link, index) => (
                    <SlideBarButton
                      key={index}
                      icon={link.icon}
                      path={link.path}
                      name={link.name}
                      isSidebarOpen={isSidebarOpen}
                      onClick={() => setIsSidebarOpen(false)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Bottom Actions - isolated from scroll area */}
        <div className="mt-auto shrink-0 p-3 md:p-4 flex text-[var(--text-primary)] flex-col gap-y-2 border-t border-[var(--border-subtle)] bg-[var(--surface-elevated)] backdrop-blur-md z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
          <SlideBarButton
            icon="IoMdSettings"
            path="/dashboard/setting"
            name="Account Settings"
            isSidebarOpen={isSidebarOpen}
            onClick={() => setIsSidebarOpen(false)}
          />

          <button
            className={`flex items-center ${isSidebarOpen ? "justify-start" : "justify-center md:justify-start"} gap-x-3 text-[var(--text-muted)] text-xs font-bold uppercase tracking-wider px-3 py-2.5 rounded-2xl hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 cursor-pointer group`}
            onClick={() => {
              setIsSidebarOpen(false);
              setLogOutModal({
                heading: "Confirm Logout?",
                text1: "You will need to login again to access your dashboard.",
                button1Text: "Logout",
                button2Text: "Cancel",
                button1Handler: () => dispatch(setLogOut(navigate)),
                button2Handler: () => setLogOutModal(null),
              });
            }}
          >
            <IoIosLogOut className="text-xl text-red-400 group-hover:scale-110 transition-transform flex-shrink-0" />
            <span className={`${isSidebarOpen ? "block" : "hidden"} md:block`}>Logout</span>
          </button>
        </div>
      </div>

      {logOutModal && <ConfirmationModal modalData={logOutModal} />}
    </>
  );
};

export default SideBar;
