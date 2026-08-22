import toast from "react-hot-toast"
import {setLoading, settoken} from  '../../Slices/Auth'
import { apiConnector } from "../apiConnector"
import { endpoints } from "../apis"
import { setUser } from "../../Slices/Profile"

const {
    CHAT_BOT,
    SENDOTP_API ,
    SIGNUP_API ,
    LOGIN_API,
    GOOGLE_AUTH_LOGIN_API,
    RESETPASSTOKEN_API ,
    RESETPASSWORD_API
} = endpoints

export function askAI(query, setAnswer) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
    dispatch(setLoading(true));

    try {
      const response = await apiConnector(
        "POST",
        CHAT_BOT,
        { query }
      );

      if (!response || !response.data.success) {
        throw new Error(response?.data?.message || "AI failed");
      }

      setAnswer(response.data.aiAnswer);
    } catch (error) {
      console.log("Error in askAI:", error);
      toast.error("Failed to get AI response");
    }

    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function  sendOtp(email){

    return async (dispatch)=>{

        const toastId = toast.loading("loading...")
        dispatch(setLoading(true))
        const normalizedEmail = email?.trim().toLowerCase()
        try{
            const response = await apiConnector("POST" , SENDOTP_API , {
                email: normalizedEmail ,
                checkUserPresent : true
            } )
           
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || "Unable to send OTP")
            }

            toast.success("OTP sent")
            return true
        }catch(error){
            console.log("error in sending OTP")
            console.log(error.response?.data || error)
            toast.error(error.response?.data?.message || "OTP can't send")
            return false
        } finally {
            dispatch(setLoading(false))
            toast.dismiss(toastId)
        }

    }
}

export function signUp(registrationData, otp , navigate){
    return async (dispatch)=>{
        const toastId = toast.loading("loading...")
        dispatch(setLoading(true))
        
        try{
            const payload = typeof registrationData === "object"
                ? {
                    ...registrationData,
                    email: registrationData.email?.trim().toLowerCase(),
                    otp,
                  }
                : {};

            const response = await apiConnector("POST" , SIGNUP_API , {
                ...payload,
                confirmPassword: payload.confirmPassword,
            })

           if (!response.data || !response.data.success) {
               throw new Error(response.data?.message || "Unknown error occurred");
            }

            toast.success("Registration submitted for review")
            navigate('/login')

        }catch(error){

            console.log(error.response?.data || error)
            toast.error(error.response?.data?.message || "Registration failed")

        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}

export function setLogin(email , password , navigate){
    return async (dispatch)=>{
        
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try{

            const response = await apiConnector("POST" , LOGIN_API , {
                email: email?.trim().toLowerCase(), 
                password
            })
            

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            const token = response.data.token || response.data.data?.token || response.data.data?.accessToken
            const userData = response.data.user || response.data.data?.user || response.data.User

            dispatch(settoken(token))
            localStorage.setItem("token" , JSON.stringify(token))

            dispatch(setUser(userData))
            localStorage.setItem("user" , JSON.stringify(userData))
            
            toast.success("Login")
            navigate("/")

        }catch(error){
             console.log(error.response?.data || error)
             console.log("error in Login")
             if(error.response?.data?.googleAuth)
             {
                toast.error("Try to login Using Google")
            }else if(error.response?.data?.code?.startsWith("ACCOUNT_")){
                const status = error.response?.data?.details?.accountStatus
                const reason = error.response?.data?.details?.latestReview?.reason
                toast.error(reason ? `Account ${status}: ${reason}` : "Your registration is still under review")
            }else{
                toast.error(error.response?.data?.message || "login failed")
             }
             
        } finally {
            dispatch(setLoading(false))
            toast.dismiss(toastId)
        }
        
    }
}

export function setGoogleLogin(credential, accountType, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...");
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
    }

    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

export function setLogOut(navigate){
    return async (dispatch)=>{
        
        const toastId = toast.loading("Loading...")
        dispatch(setLoading(true))
        try{

            dispatch(setUser(null))
            localStorage.removeItem("token")

            dispatch(settoken(null))
            localStorage.removeItem("user")

            toast.success("LogOut")

            

            navigate("/login")

        }catch(error){
             console.log(error)
             console.log("error in LogOut")
             toast.error("logOut failed")
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
        
    }
}

export function sendTokenLink(email , navigate){
    return async(dispatch)=>{
        const toastId = toast.loading("Loading")
        dispatch( setLoading(true))
        try{

            const response = await apiConnector("POST" , RESETPASSTOKEN_API , {
                email
            } )

            if(!response){
                navigate("/resendToken")
            }

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            toast.success("Check Email")

        }catch(error){
           console.log("unable to send Token Email")
           console.log(error)   
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}

export function forgotPassword( password , confirmedPassword , token , navigate){
    return async(dispatch)=>{
        const toastId = toast.loading("Loading")
        dispatch( setLoading(true))
        try{

            const response = await apiConnector("POST" , RESETPASSWORD_API , {
                password ,
                confirmedPassword,
                token
            } )

            if(!response.data.success){
                throw new Error(response.data.message)
            }

            toast.success("Password Update successfully")
            navigate("/resetCompletePage")

        }catch(error){
           console.log("unable to update password")
           console.log(error)   
        }
        dispatch(setLoading(false))
        toast.dismiss(toastId)
    }
}
