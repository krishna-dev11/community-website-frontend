import React, { useState } from "react";
import { NavbarLinks } from "../../data/navbar-links";
import { Link, matchPath, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { MdOutlineShoppingCart } from "react-icons/md";
import { setLogOut } from "../../services/Operations/authAPI";
import { RiDashboard2Line } from "react-icons/ri";
import { IoLogOutOutline } from "react-icons/io5";
import { CiLogin } from "react-icons/ci";
import { FiMenu, FiX } from "react-icons/fi"; // Mobile Icons

const NavBar = () => {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const conditionFormNavBarWholeStyle =
    location.pathname.split("/").includes("EnrolledCourses") ||
    location.pathname.split("/").includes("course");

  function mathroute(route) {
    if (!route) return false;
    return matchPath({ path: route }, location.pathname);
  }

  return (
    <div
      className={`w-full h-[72px] fixed z-[1000] transition-all duration-300 ${
        conditionFormNavBarWholeStyle ? "" : " "
      }`}
    >
      <div className="flex justify-between items-center w-11/12 mx-auto h-full px-4 md:px-10">
        
        
        <Link onClick={() => setIsMenuOpen(false)} to={"/"}>
          <div className="flex items-center -translate-x-6 gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6A0DAD]/20 flex items-center justify-center border border-[#6A0DAD]/30 shadow-lg shrink-0">
              <span className="text-[#ffffff] font-black text-lg">V</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#ffffff]">
                BOLD VOICE
              </span>
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#10b981]/80">
                Spoken English
              </span>
            </div>
          </div>
        </Link>

        
        <ul className="hidden lg:flex gap-x-8 border border-[#ffffff]/10 bg-[#ffffff]/5 backdrop-blur-xl px-12 py-2.5 rounded-2xl">
          {NavbarLinks.filter(
            (link) => link?.title !== "Catalog" && link?.title !== "Category"
          ).map((link, index) => (
            <li key={index} className="relative group">
              <Link
                to={link?.path}
                className={`text-sm font-medium transition-all ${
                  mathroute(link?.path)
                    ? "text-[#10b981]"
                    : "text-[#ffffff] hover:text-[#10b981]"
                }`}
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>

        
        <div className="flex items-center gap-x-4 md:gap-x-6">
          
          
          {token && user?.accountType !== "Instructor" && (
            <Link to={"/dashboard/wishlist"} className="relative">
              <MdOutlineShoppingCart
                className={
                  conditionFormNavBarWholeStyle
                    ? "text-white"
                    : "text-[#ffffff]"
                }
                size={24}
              />
              {user.cart?.length > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-[#10b981] text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {user.cart.length}
                </span>
              )}
            </Link>
          )}

          
          <div className="hidden md:flex items-center gap-x-4">
            {token === null ? (
              <>
                <Link
                  to="/login"
                  className="bg-[#ffffff]/5 border border-[#ffffff]/10 text-[#ffffff] px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#ffffff]/10 transition-all flex items-center gap-2"
                >
                  <CiLogin size={18} /> Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#ffffff] text-[#000000] px-5 py-2 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-[#10b981] transition-all"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative group">
                <img
                  src={user?.imageUrl}
                  className="h-9 w-9 rounded-full border border-[#10b981] cursor-pointer"
                  alt="Profile"
                />
                
                <div className="absolute right-0 top-12 w-48 bg-[#0a0a0a] border border-[#ffffff]/10 rounded-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-2 shadow-2xl z-50">
                  <button
                    onClick={() => navigate("/dashboard/my-profile")}
                    className="w-full flex items-center gap-3 p-3 text-xs font-bold uppercase text-[#9ca3af] hover:text-[#ffffff] hover:bg-[#ffffff]/5 rounded-xl transition-all"
                  >
                    <RiDashboard2Line size={18} /> Dashboard
                  </button>
                  <button
                    onClick={() => dispatch(setLogOut(navigate))}
                    className="w-full flex items-center gap-3 p-3 text-xs font-bold uppercase text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-all"
                  >
                    <IoLogOutOutline size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-[#ffffff] p-2 hover:bg-[#ffffff]/10 rounded-lg transition-all"
          >
            {isMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
          </button>
        </div>
      </div>

      
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[999] lg:hidden transition-all duration-500 ${
          isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`absolute right-0 top-0 h-full w-[300px] bg-[#050505] border-l border-white/10 p-8 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] transition-transform duration-500 ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          
          {token && (
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-6">
              <img
                src={user?.imageUrl}
                className="h-10 w-10 rounded-full border border-[#10b981] object-cover"
                alt="User"
              />
              <div className="flex flex-col">
                <p className="text-sm font-bold text-white truncate w-32">
                  {user?.firstName} {user?.lastName}
                </p>
                <Link
                  to="/dashboard/my-profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  <RiDashboard2Line size={12} /> Dashboard Entry
                </Link>
              </div>
            </div>
          )}

          
          <div className="flex flex-col gap-y-2 flex-1 overflow-y-auto custom-scrollbar">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#4b5563] mb-4">
              Navigation Node
            </p>

            {NavbarLinks.filter(
              (link) => link?.title !== "Catalog" && link?.title !== "Category"
            ).map((link, i) => (
              <div key={i} className="flex flex-col border-b border-white/5 pb-2">
                <Link
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-xl font-bold tracking-tighter py-3 transition-colors ${
                    mathroute(link.path)
                      ? "text-[#10b981]"
                      : "text-white hover:text-[#10b981]"
                  }`}
                >
                  {link.title}
                </Link>
              </div>
            ))}
            {token && (
              <Link
                to="/dashboard/my-profile"
                onClick={() => setIsMenuOpen(false)}
                className={`text-xl font-bold tracking-tighter flex items-center gap-3 ${
                  mathroute("/dashboard/my-profile")
                    ? "text-[#10b981]"
                    : "text-white"
                }`}
              >
                <RiDashboard2Line className="text-[#10b981]" size={22} />{" "}
                Dashboard
              </Link>
            )}
          </div>

          
          <div className="mt-auto flex flex-col gap-4 pt-8 border-t border-white/10">
            {token === null ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-4 text-center bg-white/5 rounded-2xl text-white font-bold uppercase tracking-widest text-xs border border-white/10"
                >
                  Login Node
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full py-4 text-center bg-white rounded-2xl text-black font-bold uppercase tracking-widest text-xs hover:bg-[#10b981] transition-all"
                >
                  Initialize Access
                </Link>
              </>
            ) : (
              <button
                onClick={() => {
                  dispatch(setLogOut(navigate));
                  setIsMenuOpen(false);
                }}
                className="w-full py-4 bg-[#ef4444]/10 text-[#ef4444] rounded-2xl font-bold uppercase tracking-widest text-xs border border-red-500/20 flex items-center justify-center gap-2"
              >
                <IoLogOutOutline /> Logout Terminal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;