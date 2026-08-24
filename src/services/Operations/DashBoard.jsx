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
  return async (dispatch, getState) => {
    const toastId = toast.loading("Saving profile picture...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("PUT", UPDATE_DISPLAY_PICTURE_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const raw = response.data.data;
      const updatedUser = raw?.data || raw;
      const currentUser = getState().profile?.user || {};
      const mergedUser = {
        ...currentUser,
        ...(typeof updatedUser === "object" ? updatedUser : {}),
        imageUrl: typeof updatedUser === "string" ? updatedUser : (updatedUser?.imageUrl || currentUser.imageUrl),
      };

      dispatch(setUser(mergedUser));
      localStorage.setItem("user", JSON.stringify(mergedUser));
      toast.success("Profile Image Saved Successfully");
    } catch (error) {
      console.error(error.response?.data || error);
      toast.error(error.response?.data?.message || "Profile image update failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function UpdateProfileDetails(token, data) {
  return async (dispatch, getState) => {
    const toastId = toast.loading("Updating profile...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("PUT", UPDATE_PROFILE_API, data, {
        Authorization: `Bearer ${token}`,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const raw = response.data.data;
      const updatedUser = raw?.data || raw;
      const currentUser = getState().profile?.user || {};

      const mergedUser = {
        ...currentUser,
        ...(typeof updatedUser === "object" ? updatedUser : {}),
        additionalDetails: {
          ...(currentUser.additionalDetails || {}),
          ...(typeof updatedUser?.additionalDetails === "object" ? updatedUser.additionalDetails : {}),
          ...(typeof updatedUser?.profile === "object" ? updatedUser.profile : {}),
        },
      };

      dispatch(setUser(mergedUser));
      localStorage.setItem("user", JSON.stringify(mergedUser));
      toast.success("Personal Details Updated Successfully");
    } catch (error) {
      console.error(error.response?.data || error);
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
