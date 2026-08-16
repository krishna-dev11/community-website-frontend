import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import { forgotPassword } from "../services/Operations/authAPI";

const UpdatePassword = () => {
  const [formData, setFormData] = useState({
    CreateNewPassword: "",
    ConfirmNewPassword: "",
  });
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const [showCreatepassword, setshowCreatepassword] = useState(false);
  const [showConfirmPassword, setshowConfirmPassword] = useState(false);

  const location = useLocation();
  const token = location.pathname.split("/").at(-1);

  const changeHandler = (event) => {
    const { type, name, value, checked } = event.target;
    setFormData((prev) => {
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
  };

  const SubmitHandler = (event) => {
    event.preventDefault();

    if (formData.ConfirmNewPassword !== formData.CreateNewPassword) {
      toast.error("Both Password Can't Match");
    }

    dispatch(
      forgotPassword(
        formData.CreateNewPassword,
        formData.ConfirmNewPassword,
        token,
        navigate
      )
    );
  };

  return (
    <div className=" flex  flex-col gap-y-5 h-screen w-full justify-center items-center bg-richblack-900">
      <div className="  w-[30%] flex flex-col border-richblack-400 border p-10 rounded-md gap-y-5">
        <p className=" text-2xl text-white font-semibold">Choose  new password</p>

        <p className=" text-richblack-300 font-inter text-[.8rem] ">
          Almost done. Enter your new password and youre all set.
        </p>

        <form onSubmit={SubmitHandler}>
          <div className="flex gap-x-3 flex-col gap-y-5">
            <label className="relative">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                New Password<sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                className="w-full rounded-[0.5rem] bg-richblack-800  p-[10px] placeholder-gray-500 text-richblack-5"
                type={showCreatepassword ? "text" : "password"}
                placeholder="Enter New Password"
                name="CreateNewPassword"
                onChange={changeHandler}
                value={formData.CreateNewPassword}
                style={{
                  boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
              />
              <span
                onClick={() => {
                  setshowCreatepassword(!showCreatepassword);
                }}
                className="top-10 right-5 absolute"
              >
                {showCreatepassword ? (
                  <FaEyeSlash fill="white" />
                ) : (
                  <FaEye fill="white" />
                )}
              </span>
            </label>
            <label className=" relative">
              <p className="mb-1 text-[0.875rem] leading-[1.375rem] text-richblack-5">
                Confirm New Password<sup className="text-pink-200">*</sup>
              </p>
              <input
                required
                className="w-full rounded-[0.5rem] bg-richblack-800  p-[10px] placeholder-gray-500 text-richblack-5"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirn New Password"
                name="ConfirmNewPassword"
                onChange={changeHandler}
                value={formData.ConfirmNewPassword}
                style={{
                  boxShadow: "inset 0px -1px 0px rgba(255, 255, 255, 0.18)",
                }}
              />
              <span
                onClick={() => {
                  setshowConfirmPassword(!showConfirmPassword);
                }}
                className="top-10 right-5 absolute"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash fill="white" />
                ) : (
                  <FaEye fill="white" />
                )}
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-[8px] bg-yellow-50 py-[8px] px-[12px] font-medium text-richblack-900"
          >
            Reset Password
          </button>
        </form>

        <Link to={"/"} className="flex gap-x-3 items-baseline">
          <FaArrowLeftLong fill="white" />
          <p className="text-white -translate-y-1" >Back to login</p>
        </Link>
      </div>
    </div>
  );
};

export default UpdatePassword;
