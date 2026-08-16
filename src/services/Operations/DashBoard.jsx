import toast from "react-hot-toast";
import { settingsEndpoints } from "../apis";
import { setLoading, setUser } from "../../Slices/Profile";
import { apiConnector } from "../apiConnector";
import { settoken } from "../../Slices/Auth";

const {
  UPDATE_DISPLAY_PICTURE_API,
  UPDATE_PROFILE_API,
  CHANGE_PASSWORD_API,
  DELETE_PROFILE_API,
} = settingsEndpoints;

export function updateDisplayPicture(token, data) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("PUT", UPDATE_DISPLAY_PICTURE_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setUser(response.data.data));
      localStorage.setItem("user", JSON.stringify(response.data.data));
      toast.success("Profile Image Save Successfully");
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error(error.response?.data?.message || "Profile image update failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function UpdateProfileDetails(token, data) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      dispatch(setUser(response.data.data));
      localStorage.setItem("user", JSON.stringify(response.data.data));
      toast.success("Personal Details Updated");
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error(error.response?.data?.message || "Profile update failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function ChangePassword(token, data) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", CHANGE_PASSWORD_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Password Updated Successfully");
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error(error.response?.data?.message || "Password update failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function DeleteAccountPermanentaly(token, data, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("DELETE", DELETE_PROFILE_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      dispatch(settoken(null));
      dispatch(setUser(null));
      toast.success("Account Deleted");
      navigate("/signup");
    } catch (error) {
      console.log(error.response?.data || error);
      toast.error(error.response?.data?.message || "Account delete failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}
