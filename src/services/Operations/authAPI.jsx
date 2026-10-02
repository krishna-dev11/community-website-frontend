import toast from "react-hot-toast";
import { setLoading, settoken, setSignUpData } from "../../Slices/Auth";
import { setUser } from "../../Slices/Profile";
import { apiConnector } from "../apiConnector";
import { endpoints } from "../apis";

const {
  CHAT_BOT,
  SENDOTP_API,
  VERIFY_OTP_API,
  SIGNUP_API,
  LOGIN_API,
  GOOGLE_AUTH_LOGIN_API,
  LOGOUT_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
  CLAIM_PROFILE_REQUEST_OTP_API,
  CLAIM_PROFILE_VERIFY_API,
} = endpoints;

export const pendingSignupFiles = {
  identityDocument: null,
  photo: null,
  memberFiles: {}, // { [index]: { doc: File, photo: File } }
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

export function sendOtp(contact, options = {}) {
  return async (dispatch) => {
    const toastId = toast.loading("Sending verification code...");
    dispatch(setLoading(true));
    const trimmed = contact?.trim();
    const isEmail = trimmed && trimmed.includes("@");
    try {
      const payload = {
        email: isEmail ? trimmed.toLowerCase() : undefined,
        phone: !isEmail ? trimmed : undefined,
        channel: isEmail ? "EMAIL" : "PHONE",
        purpose: options.purpose || "REGISTRATION_CONTACT_VERIFICATION",
        memberKey: options.memberKey || "head",
        sessionToken: options.sessionToken || undefined,
        checkUserPresent: options.checkUserPresent ?? false,
      };

      const response = await apiConnector("POST", SENDOTP_API, payload);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Unable to send verification code");
      }

      toast.success(response.data?.message || "Verification code sent");
      return response.data?.data || true;
    } catch (error) {
      console.log("Error in sending OTP", error);
      toast.error(error.response?.data?.message || "Could not send verification code");
      return false;
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function verifyOtp(contact, otp, options = {}) {
  return async (dispatch) => {
    const toastId = toast.loading("Verifying code...");
    dispatch(setLoading(true));
    const trimmed = contact?.trim();
    const isEmail = trimmed && trimmed.includes("@");
    try {
      const payload = {
        contact: trimmed,
        email: isEmail ? trimmed.toLowerCase() : undefined,
        phone: !isEmail ? trimmed : undefined,
        channel: isEmail ? "EMAIL" : "PHONE",
        otp: String(otp).trim(),
        purpose: options.purpose || "REGISTRATION_CONTACT_VERIFICATION",
        memberKey: options.memberKey || "head",
        sessionToken: options.sessionToken || undefined,
      };

      const response = await apiConnector("POST", VERIFY_OTP_API, payload);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || "Verification failed");
      }

      toast.success("Contact verified successfully");
      return response.data?.data || true;
    } catch (error) {
      console.log("Error in verifyOTP", error);
      toast.error(error.response?.data?.message || "Invalid verification code");
      return false;
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function signUp(registrationData, otp, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Submitting family application...");
    dispatch(setLoading(true));

    try {
      const formData = new FormData();

      const textFields = typeof registrationData === "object" ? registrationData : {};
      Object.entries(textFields).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (typeof value === "object" && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      formData.append("otp", String(otp));

      // Attach Family Head document
      if (pendingSignupFiles.identityDocument instanceof File) {
        formData.append("identityDocument", pendingSignupFiles.identityDocument);
      }
      // Attach Family Head photo if provided
      if (pendingSignupFiles.photo instanceof File) {
        formData.append("photo", pendingSignupFiles.photo);
      }

      // Attach member documents & photos
      if (pendingSignupFiles.memberFiles) {
        Object.entries(pendingSignupFiles.memberFiles).forEach(([index, files]) => {
          if (files.doc instanceof File) {
            formData.append(`member_doc_${index}`, files.doc);
          }
          if (files.photo instanceof File) {
            formData.append(`member_photo_${index}`, files.photo);
          }
        });
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
      pendingSignupFiles.memberFiles = {};

      const headMemberId = response.data?.data?.head?.memberId;
      toast.success(
        headMemberId
          ? `Application submitted! Family Head Member ID: ${headMemberId}`
          : "Family application submitted! Awaiting committee approval."
      );
      navigate("/login");
    } catch (error) {
      console.log("Registration error:", error.response?.data || error);
      toast.error(error.response?.data?.message || "Registration failed. Please check your details.");
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function setLogin(identifier, password, navigate, onMustChangePassword = null) {
  return async (dispatch) => {
    const toastId = toast.loading("Logging in...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email: identifier?.trim(),
        memberId: identifier?.trim(),
        identifier: identifier?.trim(),
        password,
      });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const token = response.data.token || response.data.data?.token || response.data.data?.accessToken;
      const userData = response.data.user || response.data.data?.user || response.data.User;
      const mustChangePassword = Boolean(response.data.mustChangePassword || response.data.data?.mustChangePassword || userData?.mustChangePassword);

      dispatch(settoken(token));
      localStorage.setItem("token", JSON.stringify(token));

      dispatch(setUser(userData));
      localStorage.setItem("user", JSON.stringify(userData));

      if (mustChangePassword && onMustChangePassword) {
        toast("Please set your personal password before continuing.", { icon: "🔐" });
        onMustChangePassword(true);
      } else {
        toast.success(userData?.memberId ? `Welcome back (${userData.memberId})!` : "Welcome back!");
        navigate("/");
      }
    } catch (error) {
      console.log("Login error:", error.response?.data || error);
      if (error.response?.data?.googleAuth) {
        toast.error("Please login using Google");
      } else if (error.response?.data?.code === "AMBIGUOUS_EMAIL_LOGIN") {
        toast.error(error.response.data.message, { duration: 6000 });
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

export function claimProfileRequestOtp(identifier) {
  return async (dispatch) => {
    const toastId = toast.loading("Finding member record...");
    dispatch(setLoading(true));
    try {
      const payload = /^SMJ-[A-Z0-9]+$/i.test(identifier?.trim())
        ? { memberId: identifier.trim().toUpperCase() }
        : { identityNumber: identifier?.trim() };

      const response = await apiConnector("POST", CLAIM_PROFILE_REQUEST_OTP_API, payload);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      toast.success(response.data.message);
      return response.data.data;
    } catch (error) {
      console.log("Claim profile error:", error);
      toast.error(error.response?.data?.message || "Unable to find record for claim");
      return null;
    } finally {
      dispatch(setLoading(false));
      toast.dismiss(toastId);
    }
  };
}

export function claimProfileVerify(payload, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Activating profile & setting password...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", CLAIM_PROFILE_VERIFY_API, payload);

      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      const token = response.data.data?.token || response.data.data?.accessToken;
      const userData = response.data.data?.user;

      dispatch(settoken(token));
      localStorage.setItem("token", JSON.stringify(token));

      dispatch(setUser(userData));
      localStorage.setItem("user", JSON.stringify(userData));

      toast.success("Profile claimed & activated successfully! Welcome to Samaj Portal.");
      navigate("/");
      return true;
    } catch (error) {
      console.log("Claim verification error:", error);
      toast.error(error.response?.data?.message || "Failed to claim profile. Check details and OTP.");
      return false;
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
