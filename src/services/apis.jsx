const BASE_URL = import.meta.env.VITE_API_URL

export const endpoints = {
  CHAT_BOT : BASE_URL + "/ai/chat" , 
  SENDOTP_API: BASE_URL + "/auth/sendOTP",
  SIGNUP_API: BASE_URL + "/auth/signUP",
  LOGIN_API: BASE_URL + "/auth/login",
  GOOGLE_AUTH_LOGIN_API : BASE_URL + "/auth/google-login",
  LOGOUT_API: BASE_URL + "/auth/loginOut",
  RESETPASSTOKEN_API: BASE_URL + "/auth/forgotpasswordToken",
  RESETPASSWORD_API: BASE_URL + "/auth/forgotPassword",
}

export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getUserDetails",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_ALL_COURSES_OF_INSTRUCTOR_FOR_DASHBOARD : BASE_URL + "/profile/getAllCoursesOfInstructorForInstructorDashBoard",
  GET_INSTRUCTOR_DASHBOARD_DATA: BASE_URL + "/profile/GetInstructorDasboardData",
  
}

export const studentEndpoints = {
  COURSE_PAYMENT_API: BASE_URL + "/payment/capturePayment",
  COURSE_VERIFY_API: BASE_URL + "/payment/verifyPayment",
  SEND_PAYMENT_SUCCESS_EMAIL_API: BASE_URL + "/payment/sendPaymentSuccessEmail",
}

export const courseEndpoints = {
  GET_ALL_COURSE_API: BASE_URL + "/course/getAllCourses",
  COURSE_DETAILS_API: BASE_URL + "/course/getCourseDetails",
  EDIT_COURSE_API: BASE_URL + "/course/editCourse",
  COURSE_CATEGORIES_API: BASE_URL + "/course/getAllCategory",
  CREATE_COURSE_API: BASE_URL + "/course/createCourse",
  CREATE_SECTION_API: BASE_URL + "/course/createSection",
  CREATE_SUBSECTION_API: BASE_URL + "/course/createSubSection",
  UPDATE_SECTION_API: BASE_URL + "/course/updateSection",
  UPDATE_SUBSECTION_API: BASE_URL + "/course/updateSubSection",
  GET_ALL_INSTRUCTOR_COURSES_API: BASE_URL + "/course/getInstructorCourses",
  DELETE_SECTION_API: BASE_URL + "/course/deleteSection",
  DELETE_SUBSECTION_API: BASE_URL + "/course/deleteSubSection",
  DELETE_COURSE_API: BASE_URL + "/course/deleteCourseOfInstructor",
  GET_FULL_COURSE_DETAILS_AUTHENTICATED:
    BASE_URL + "/course/getAllDetailsOfOneCourse",
  LECTURE_COMPLETION_API: BASE_URL + "/course/updateCourseProgress",
  CREATE_RATING_API: BASE_URL + "/course/createRating",
  PUBLISH_COURSE_API: BASE_URL + "/course/publishCourse",
  GET_INSTRUCTORs_All_COURSES_API: BASE_URL + "/course/getAllCoursesOfInstructor",
  GET_CATEGORY_WISE_COURSES_API: BASE_URL + "/course/categoryPageDetails",
  GET_ALL_COURSES_DETAILS_FOR_CARD_VIEW : BASE_URL + "/course/getEnrolledCoursesDataForCardViews",
  UPDATE_COURSE_PROGRESS_API : BASE_URL + "/course/updateCourseProgress" , 
  GET_COURSE_PROGRESS_PERSENTAGE : BASE_URL + "/course/getCourseCompletionPercentage",
  GET_TOTAL_COURSE_DURATION : BASE_URL + "/course/getTotalCourseDuration"

}

export const CartEndpoints = {
  ADD_COURSE_IN_CART_API: BASE_URL + "/course/AddCourseInCart",
  REMOVED_COURSE_IN_CART_API: BASE_URL + "/course/RemoveCourseInCart",
  EMTYING_CART_API: BASE_URL + "/course/EmptyCart"

}

export const ratingsEndpoints = {
  CREATE_RATING_API: BASE_URL + "/course/createRatingAndReviews",
  GET_ALL_RATING_AND_REVIEW : BASE_URL + "/course/getAllRatingAndReviews"
}

export const categories = {
  CATEGORIES_API: BASE_URL + "/course/showAllCategories",
}

export const catalogData = {
  CATALOGPAGEDATA_API : BASE_URL + "/course/categoryPageDetails",
}

export const contactusEndpoint = {
  CONTACT_US_API: BASE_URL + "/reach/contact",
}

export const settingsEndpoints = {
  UPDATE_DISPLAY_PICTURE_API: BASE_URL + "/profile/updateDisplayPicture",
  UPDATE_PROFILE_API: BASE_URL + "/profile/updateProfile",
  CHANGE_PASSWORD_API: BASE_URL + "/auth/changePassword",
  DELETE_PROFILE_API: BASE_URL + "/profile/deleteAccount",
}

export const WalkINEndPoints = {
  ADD_WALKIN_API: BASE_URL + "/walkin/addWalkInStudent",
  CONVERT_WALKIN: BASE_URL + "/walkin/convertWalkInToUser",
  UPDATE_STATUS: BASE_URL + "/walkin/updateWalkInStatus",
  GET_ALL_WALKINS : BASE_URL + "/walkin/getAllWalkIns"
};

export const ExpenseEndPoints = {
  ADD_EXPENSE_API : BASE_URL + "/expense/addExpense",
  
}

export const TestimonialEndPoints = {
  ADD_TESTIMONIAL: BASE_URL + "/testimonial/addTestimonial",
  GET_ALL_TESTIMONIAL :BASE_URL + "/testimonial/getAllTestimonials" ,
  DELETE_TESTIMONIAL : BASE_URL + "/testimonial/deleteTestimonial"
}

export const InstallmentEndPoints = {
  ADD_INSTALLMENT : BASE_URL + "/enrollment/add-installment"
}

