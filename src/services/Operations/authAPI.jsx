import toast from "react-hot-toast";
import { setLoading, settoken, setSignUpData } from "../../Slices/Auth";
import { setUser } from "../../Slices/Profile";
import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";

const {
  CHAT_BOT,
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  GOOGLE_AUTH_LOGIN_API,
  LOGOUT_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
} = endpoints;

export const pendingSignupFiles = {
  identityDocument: null,
  photo: null,
};

export function askAI(query, setAnswer) {
  return async (dispatch) => {
    const toastId = toast.loading("Connecting to Samaj AI...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector("POST", CHAT_BOT, { query });

      if (!response || !response.data.success) {
        throw new Error(response?.data?.message || "AI failed");
      }

      setAnswer(response.data.aiAnswer);
    } catch (error) {
      console.log("Error in askAI:", error);
      toast.error("Failed to get AI response");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function sendOtp(email) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending OTP...");
    dispatch(setLoading(true));
    const normalizedEmail = email?.trim().toLowerCase();
    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email: normalizedEmail,
        checkUserPresent: true,
      });

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Unable to send OTP");
      }

      toast.success("OTP sent to your email");
      return true;
    } catch (error) {
      console.log("Error in sending OTP", error);
      toast.error(error.response?.data?.message || "Could not send OTP");
      return false;
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function signUp(registrationData, otp, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Submitting registration...");
    dispatch(setLoading(true));

    try {
      // Build multipart/form-data so files and text fields are sent together
      const formData = new FormData();

      const textFields = typeof registrationData === "object" ? registrationData : {};
      Object.entries(textFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          formData.append(key, String(value));
        }
      });
      formData.append("otp", String(otp));

      // Attach actual document file
      if (pendingSignupFiles.identityDocument instanceof File) {
        formData.append("identityDocument", pendingSignupFiles.identityDocument);
      }
      // Attach actual photo file if provided
      if (pendingSignupFiles.photo instanceof File) {
        formData.append("photo", pendingSignupFiles.photo);
      }

      const response = await apiConnector("POST", SIGNUP_API, formData, {
        withCredentials: true,
      });

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || "Registration failed");
      }

      // Clear pending files
      pendingSignupFiles.identityDocument = null;
      pendingSignupFiles.photo = null;

      toast.success("Application submitted! Awaiting admin approval.");
      navigate("/login");
    } catch (error) {
      console.log("Registration error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Registration failed. Please verify your details.");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function setLogin(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Logging in...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email: email?.trim().toLowerCase(),
        password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const token = response.data.token || response.data.data?.token || response.data.data?.accessToken;
      const userData = response.data.user || response.data.data?.user || response.data.User;

      dispatch(settoken(token));
      localStorage.setItem("token", JSON.stringify(token));

      dispatch(setUser(userData));
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      console.log("Login error:", error.response?.data || error);
      if (error.response?.data?.googleAuth) {
        toast.error("Please login using Google");
      } else if (error.response?.data?.code?.startsWith("ACCOUNT_")) {
        const status = error.response?.data?.details?.accountStatus;
        const reason = error.response?.data?.details?.latestReview?.reason;
        toast.error(reason ? `Account ${status}: ${reason}` : "Your registration application is under committee review");
      } else {
        toast.error(error.response?.data?.message || "Login failed");
      }
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function setGoogleLogin(credential, accountType, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Authenticating...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "POST",
        GOOGLE_AUTH_LOGIN_API,
        {
          token: credential,
          accountType: accountType,
        },
        { withCredentials: true }
      );

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const userData = response.data.user ?? response.data.User;

      dispatch(settoken(response.data.token));
      localStorage.setItem("token", JSON.stringify(response.data.token));

      dispatch(setUser(userData));
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Google Login Successful");
      navigate("/");
    } catch (error) {
      console.log("Google login error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Google login failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function setLogOut(navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Logging out...");
    dispatch(setLoading(true));
    try {
      dispatch(setUser(null));
      localStorage.removeItem("token");

      dispatch(settoken(null));
      localStorage.removeItem("user");

      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.log("Error in LogOut:", error);
      toast.error("Logout failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function sendTokenLink(email, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending password reset link...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, { email });

      if (!response) {
        navigate("/resendToken");
        return;
      }

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Check your email for reset instructions");
    } catch (error) {
      console.log("Unable to send reset token email:", error);
      toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function forgotPassword(password, confirmedPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating password...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmedPassword,
        token,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success("Password updated successfully");
      navigate("/resetCompletePage");
    } catch (error) {
      console.log("Unable to update password:", error);
      toast.error(error.response?.data?.message || "Password update failed");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}
