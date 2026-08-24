const BASE_URL = import.meta.env.VITE_API_URL

export const endpoints = {
  CHAT_BOT : BASE_URL + "/ai/chat" , 
  SENDOTP_API: BASE_URL + "/auth/sendOTP",
  SIGNUP_API: BASE_URL + "/auth/signUP",
  LOGIN_API: BASE_URL + "/auth/login",
  GOOGLE_AUTH_LOGIN_API : BASE_URL + "/auth/google-login",
  LOGOUT_API: BASE_URL + "/auth/logout",
  RESETPASSTOKEN_API: BASE_URL + "/auth/forgotpasswordToken",
  RESETPASSWORD_API: BASE_URL + "/auth/forgotPassword",
}

export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getAllUserDetails",
  MEMBER_DIRECTORY_API: BASE_URL + "/profile/directory",
  GET_USER_ENROLLED_COURSES_API: BASE_URL + "/profile/getEnrolledCourses",
  GET_ALL_COURSES_OF_INSTRUCTOR_FOR_DASHBOARD : BASE_URL + "/profile/getAllCoursesOfInstructorForInstructorDashBoard",
  GET_INSTRUCTOR_DASHBOARD_DATA: BASE_URL + "/profile/GetInstructorDasboardData",
  
}

export const adminEndpoints = {
  PENDING_REGISTRATIONS_API: BASE_URL + "/auth/registrations/pending",
  REVIEW_REGISTRATION_API: (userId) => BASE_URL + `/auth/registrations/${userId}/review`,
  REGISTRATION_DOCUMENT_API: (userId) => BASE_URL + `/auth/registrations/${userId}/document`,
  ADMIN_INVITES_API: BASE_URL + "/admin/invites",
  REVOKE_ADMIN_INVITE_API: (inviteId) => BASE_URL + `/admin/invites/${inviteId}/revoke`,
  ACCEPT_ADMIN_INVITE_API: BASE_URL + "/admin/invites/accept",
  AUDIT_LOGS_API: BASE_URL + "/admin/audit-logs",
  USERS_API: BASE_URL + "/admin/users",
  UPDATE_USER_STATUS_API: (userId) => BASE_URL + `/admin/users/${userId}/status`,
  UPDATE_USER_ROLES_API: (userId) => BASE_URL + `/admin/users/${userId}/roles`,
  ANONYMIZE_USER_API: (userId) => BASE_URL + `/admin/users/${userId}/anonymize`,
}

export const familyEndpoints = {
  MY_FAMILY_API: BASE_URL + "/families/me",
  CREATE_FAMILY_API: BASE_URL + "/families",
  SEARCH_FAMILIES_API: BASE_URL + "/families/search",
  JOIN_FAMILY_API: (familyId) => BASE_URL + `/families/${familyId}/join-requests`,
  FAMILY_JOIN_REQUESTS_API: (familyId) => BASE_URL + `/families/${familyId}/join-requests`,
  REVIEW_FAMILY_JOIN_REQUEST_API: (familyId, requestId) => BASE_URL + `/families/${familyId}/join-requests/${requestId}`,
  TRANSFER_FAMILY_ADMIN_API: (familyId) => BASE_URL + `/families/${familyId}/admin`,
}

export const contentEndpoints = {
  NOTICES_API: BASE_URL + "/content/notices",
  ADMIN_NOTICES_API: BASE_URL + "/content/admin/notices",
  NOTICE_API: (noticeId) => BASE_URL + `/content/notices/${noticeId}`,
  PUBLISH_NOTICE_API: (noticeId) => BASE_URL + `/content/notices/${noticeId}/publish`,
  ARCHIVE_NOTICE_API: (noticeId) => BASE_URL + `/content/notices/${noticeId}/archive`,
  PUBLICATIONS_API: BASE_URL + "/content/publications",
  ADMIN_PUBLICATIONS_API: BASE_URL + "/content/admin/publications",
  PUBLICATION_API: (publicationId) => BASE_URL + `/content/publications/${publicationId}`,
  PUBLISH_PUBLICATION_API: (publicationId) => BASE_URL + `/content/publications/${publicationId}/publish`,
  ARCHIVE_PUBLICATION_API: (publicationId) => BASE_URL + `/content/publications/${publicationId}/archive`,
  PUBLICATION_DOWNLOAD_API: (publicationId) => BASE_URL + `/content/publications/${publicationId}/download`,
  MANAGEMENT_API: BASE_URL + "/content/management",
  MANAGEMENT_MEMBER_API: (memberId) => BASE_URL + `/content/management/${memberId}`,
  ARCHIVE_MANAGEMENT_MEMBER_API: (memberId) => BASE_URL + `/content/management/${memberId}/archive`,
  CMS_CONTENT_API: (key) => BASE_URL + `/content/cms/${key}`,
  GOTRAS_API: BASE_URL + "/content/gotras",
  GOTRA_API: (gotraId) => BASE_URL + `/content/gotras/${gotraId}`,
  ARCHIVE_GOTRA_API: (gotraId) => BASE_URL + `/content/gotras/${gotraId}/archive`,
  GALLERY_ALBUMS_API: BASE_URL + "/content/gallery/albums",
  GALLERY_ALBUM_API: (albumId) => BASE_URL + `/content/gallery/albums/${albumId}`,
  ARCHIVE_GALLERY_ALBUM_API: (albumId) => BASE_URL + `/content/gallery/albums/${albumId}/archive`,
  GALLERY_PHOTOS_API: (albumId) => BASE_URL + `/content/gallery/albums/${albumId}/photos`,
  ARCHIVE_GALLERY_PHOTO_API: (albumId, photoId) => BASE_URL + `/content/gallery/albums/${albumId}/photos/${photoId}/archive`,
}

export const opportunityEndpoints = {
  JOBS_API: BASE_URL + "/opportunities/jobs",
  ADMIN_JOBS_API: BASE_URL + "/opportunities/admin/jobs",
  UPDATE_JOB_API: (jobId) => BASE_URL + `/opportunities/jobs/${jobId}`,
  MODERATE_JOB_API: (jobId) => BASE_URL + `/opportunities/admin/jobs/${jobId}/moderate`,
  APPLY_JOB_API: (jobId) => BASE_URL + `/opportunities/jobs/${jobId}/applications`,
  JOB_APPLICATIONS_API: (jobId) => BASE_URL + `/opportunities/jobs/${jobId}/applications`,
  UPDATE_JOB_APPLICATION_STATUS_API: (applicationId) => BASE_URL + `/opportunities/job-applications/${applicationId}/status`,
  SCHOLARSHIPS_API: BASE_URL + "/opportunities/scholarships",
  ADMIN_SCHOLARSHIPS_API: BASE_URL + "/opportunities/admin/scholarships",
  SCHOLARSHIP_API: (scholarshipId) => BASE_URL + `/opportunities/scholarships/${scholarshipId}`,
  ARCHIVE_SCHOLARSHIP_API: (scholarshipId) => BASE_URL + `/opportunities/scholarships/${scholarshipId}/archive`,
  APPLY_SCHOLARSHIP_API: (scholarshipId) => BASE_URL + `/opportunities/scholarships/${scholarshipId}/applications`,
  SCHOLARSHIP_APPLICATIONS_API: (scholarshipId) => BASE_URL + `/opportunities/scholarships/${scholarshipId}/applications`,
  ADMIN_SCHOLARSHIP_APPLICATIONS_API: BASE_URL + "/opportunities/admin/scholarship-applications",
  REVIEW_SCHOLARSHIP_APPLICATION_API: (applicationId) => BASE_URL + `/opportunities/scholarship-applications/${applicationId}/review`,
}

export const paymentEndpoints = {
  DONATION_CAMPAIGNS_API: BASE_URL + "/payments/donation-campaigns",
  ADMIN_DONATION_CAMPAIGNS_API: BASE_URL + "/payments/admin/donation-campaigns",
  DONATION_CAMPAIGN_API: (campaignId) => BASE_URL + `/payments/donation-campaigns/${campaignId}`,
  ARCHIVE_DONATION_CAMPAIGN_API: (campaignId) => BASE_URL + `/payments/donation-campaigns/${campaignId}/archive`,
  CREATE_DONATION_ORDER_API: BASE_URL + "/payments/donations/orders",
  VERIFY_DONATION_API: BASE_URL + "/payments/donations/verify",
  DONATIONS_API: BASE_URL + "/payments/donations",
  MY_DONATIONS_API: BASE_URL + "/payments/me/donations",
  CONTRIBUTIONS_API: BASE_URL + "/payments/contributions",
  MY_CONTRIBUTIONS_API: BASE_URL + "/payments/me/contributions",
  CREATE_CONTRIBUTION_ORDER_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/orders`,
  GENERATE_CONTRIBUTIONS_API: BASE_URL + "/payments/contributions/generate",
  MARK_OVERDUE_CONTRIBUTIONS_API: BASE_URL + "/payments/contributions/mark-overdue",
  OFFLINE_CONTRIBUTION_PAYMENT_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/payments/offline`,
  WAIVE_CONTRIBUTION_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/waive`,
}

export const communityEndpoints = {
  DHARAMSHALAS_API: BASE_URL + "/community/dharamshalas",
  DHARAMSHALA_DETAIL_API: (id) => BASE_URL + `/community/dharamshalas/${id}`,
  ISSUES_API: BASE_URL + "/community/issues",
  UPDATE_ISSUE_STATUS_API: (issueId) => BASE_URL + `/community/issues/${issueId}/status`,
  ISSUE_RESPONSES_API: (issueId) => BASE_URL + `/community/issues/${issueId}/responses`,
  CONFIRM_ISSUE_RESOLUTION_API: (issueId) => BASE_URL + `/community/issues/${issueId}/confirm-resolution`,
  MY_DHARAMSHALA_BOOKINGS_API: BASE_URL + "/community/me/dharamshala/bookings",
  DHARAMSHALA_BOOKINGS_API: BASE_URL + "/community/dharamshala/bookings",
  REVIEW_DHARAMSHALA_BOOKING_API: (bookingId) => BASE_URL + `/community/dharamshala/bookings/${bookingId}/review`,
  CANCEL_DHARAMSHALA_BOOKING_API: (bookingId) => BASE_URL + `/community/dharamshala/bookings/${bookingId}/cancel`,
  DHARAMSHALA_AVAILABILITY_API: BASE_URL + "/community/dharamshala/availability",
  DHARAMSHALA_BLOCKED_DATES_API: BASE_URL + "/community/dharamshala/blocked-dates",
  ARCHIVE_DHARAMSHALA_BLOCKED_DATE_API: (blockId) => BASE_URL + `/community/dharamshala/blocked-dates/${blockId}/archive`,
  POLLS_API: BASE_URL + "/community/polls",
  UPDATE_POLL_STATUS_API: (pollId) => BASE_URL + `/community/polls/${pollId}/status`,
  POLL_RESULTS_API: (pollId) => BASE_URL + `/community/polls/${pollId}/results`,
  CAST_VOTE_API: (pollId) => BASE_URL + `/community/polls/${pollId}/votes`,
  POSTS_API: BASE_URL + "/community/posts",
  POST_COMMENTS_API: (postId) => BASE_URL + `/community/posts/${postId}/comments`,
  REPORT_POST_API: (postId) => BASE_URL + `/community/posts/${postId}/reports`,
  COMMUNITY_REPORTS_API: BASE_URL + "/community/reports",
  REVIEW_COMMUNITY_REPORT_API: (reportId) => BASE_URL + `/community/reports/${reportId}`,
  ACHIEVEMENTS_API: BASE_URL + "/community/achievements",
  ADMIN_ACHIEVEMENTS_API: BASE_URL + "/community/admin/achievements",
  REVIEW_ACHIEVEMENT_API: (achievementId) => BASE_URL + `/community/achievements/${achievementId}/review`,
  SHRADHANJALIS_API: BASE_URL + "/community/shradhanjalis",
  ADMIN_SHRADHANJALIS_API: BASE_URL + "/community/admin/shradhanjalis",
  REVIEW_SHRADHANJALI_API: (shradhanjaliId) => BASE_URL + `/community/shradhanjalis/${shradhanjaliId}/review`,
  MEMBERSHIP_CARD_API: BASE_URL + "/community/membership-cards/me",
  VERIFY_MEMBERSHIP_CARD_API: (memberId) => BASE_URL + `/community/membership-cards/${memberId}/verify`,
  PUBLISH_ISSUE_SOLUTION_API: (issueId) => BASE_URL + `/community/issues/${issueId}/publish-solution`,
  PUBLIC_SOLUTIONS_API: BASE_URL + "/community/solutions",
}

export const notificationEndpoints = {
  NOTIFICATIONS_API: BASE_URL + "/notifications",
  MARK_NOTIFICATION_READ_API: (notificationId) => BASE_URL + `/notifications/${notificationId}/read`,
  MARK_ALL_NOTIFICATIONS_READ_API: BASE_URL + "/notifications/read-all",
}

export const matrimonialEndpoints = {
  MY_PROFILE_API: BASE_URL + "/matrimonial/profiles/me",
  PROFILE_VISIBILITY_API: BASE_URL + "/matrimonial/profiles/me/visibility",
  PROFILES_API: BASE_URL + "/matrimonial/profiles",
  PROFILE_API: (profileId) => BASE_URL + `/matrimonial/profiles/${profileId}`,
  EXPRESS_INTEREST_API: (profileId) => BASE_URL + `/matrimonial/profiles/${profileId}/interests`,
  MY_INTERESTS_API: BASE_URL + "/matrimonial/interests/me",
  RESPOND_INTEREST_API: (interestId) => BASE_URL + `/matrimonial/interests/${interestId}`,
  REQUEST_CONTACT_API: (interestId) => BASE_URL + `/matrimonial/interests/${interestId}/contact-requests`,
  MY_CONTACT_REQUESTS_API: BASE_URL + "/matrimonial/contact-requests/me",
  REVIEW_CONTACT_REQUEST_API: (requestId) => BASE_URL + `/matrimonial/contact-requests/${requestId}`,
  REPORT_PROFILE_API: (profileId) => BASE_URL + `/matrimonial/profiles/${profileId}/reports`,
  BLOCK_PROFILE_API: (profileId) => BASE_URL + `/matrimonial/profiles/${profileId}/block`,
  ADMIN_PROFILES_API: BASE_URL + "/matrimonial/admin/profiles",
  REVIEW_PROFILE_API: (profileId) => BASE_URL + `/matrimonial/admin/profiles/${profileId}/review`,
  ADMIN_REPORTS_API: BASE_URL + "/matrimonial/admin/reports",
  REVIEW_REPORT_API: (reportId) => BASE_URL + `/matrimonial/admin/reports/${reportId}`,
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

