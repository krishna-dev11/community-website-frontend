const BASE_URL = import.meta.env.VITE_API_URL

export const endpoints = {
  CHAT_BOT : BASE_URL + "/ai/chat" , 
  SENDOTP_API: BASE_URL + "/auth/sendOTP",
  VERIFY_OTP_API: BASE_URL + "/auth/verifyOTP",
  SIGNUP_API: BASE_URL + "/auth/signUP",
  LOGIN_API: BASE_URL + "/auth/login",
  GOOGLE_AUTH_LOGIN_API: BASE_URL + "/auth/google",
  LOGOUT_API: BASE_URL + "/auth/logout",
  RESETPASSTOKEN_API: BASE_URL + "/auth/forgotpasswordToken",
  RESETPASSWORD_API: BASE_URL + "/auth/forgotPassword",
  CLAIM_PROFILE_REQUEST_OTP_API: BASE_URL + "/auth/claim-profile/request-otp",
  CLAIM_PROFILE_VERIFY_API: BASE_URL + "/auth/claim-profile/verify",
}

export const profileEndpoints = {
  GET_USER_DETAILS_API: BASE_URL + "/profile/getAllUserDetails",
  MEMBER_DIRECTORY_API: BASE_URL + "/profile/directory",
  SAMAJ_MEMBER_COUNT_API: BASE_URL + "/profile/directory/count",
  FAMILY_DIRECTORY_API: BASE_URL + "/profile/directory/families",
  FAMILY_DIRECTORY_DETAIL_API: (familyId) => BASE_URL + `/profile/directory/families/${familyId}`,
  UNLINKED_DIRECTORY_API: BASE_URL + "/profile/directory/unlinked",
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
  RESEND_ADMIN_INVITE_API: (inviteId) => BASE_URL + `/admin/invites/${inviteId}/resend`,
  VALIDATE_ADMIN_INVITE_API: (token) => BASE_URL + `/admin/invites/validate/${token}`,
  ACCEPT_ADMIN_INVITE_API: BASE_URL + "/admin/invites/accept",
  USERS_API: BASE_URL + "/admin/users",
  UPDATE_USER_STATUS_API: (userId) => BASE_URL + `/admin/users/${userId}/status`,
  UPDATE_USER_ROLES_API: (userId) => BASE_URL + `/admin/users/${userId}/roles`,
  ANONYMIZE_USER_API: (userId) => BASE_URL + `/admin/users/${userId}/anonymize`,
  // Direct Member-to-Admin Assignment
  ELIGIBLE_MEMBERS_API: BASE_URL + "/admin/members/eligible",
  ASSIGN_MEMBER_ROLES_API: (userId) => BASE_URL + `/admin/members/${userId}/roles`,
  REVOKE_MEMBER_ACCESS_API: (userId) => BASE_URL + `/admin/members/${userId}/access`,
  ACTIVE_ADMINISTRATORS_API: BASE_URL + "/admin/administrators",
  ROLE_HISTORY_API: BASE_URL + "/admin/role-history",
}

export const familyEndpoints = {
  MY_FAMILY_API: BASE_URL + "/families/me",
  CREATE_FAMILY_API: BASE_URL + "/families",
  SEARCH_FAMILIES_API: BASE_URL + "/families/search",
  JOIN_FAMILY_API: (familyId) => BASE_URL + `/families/${familyId}/join-requests`,
  FAMILY_JOIN_REQUESTS_API: (familyId) => BASE_URL + `/families/${familyId}/join-requests`,
  REVIEW_FAMILY_JOIN_REQUEST_API: (familyId, requestId) => BASE_URL + `/families/${familyId}/join-requests/${requestId}`,
  TRANSFER_FAMILY_ADMIN_API: (familyId) => BASE_URL + `/families/${familyId}/admin`,
  ADD_FAMILY_MEMBER_API: (familyId) => BASE_URL + `/families/${familyId}/members`,
  RESUBMIT_FAMILY_MEMBER_DOC_API: (familyId, memberId) => BASE_URL + `/families/${familyId}/members/${memberId}/resubmit-document`,
  FIX_AND_RESUBMIT_MEMBER_API: (familyId, memberId) => BASE_URL + `/families/${familyId}/members/${memberId}/fix-and-resubmit`,
  UPDATE_NOMINEE_API: (familyId) => BASE_URL + `/families/${familyId}/nominee`,
  REPORT_HEAD_DEATH_API: (familyId) => BASE_URL + `/families/${familyId}/succession/report-death`,
  REVIEW_SUCCESSION_API: (familyId, requestId) => BASE_URL + `/families/${familyId}/succession/${requestId}/review`,
  SUBMIT_LIFECYCLE_REQUEST_API: (familyId) => BASE_URL + `/families/${familyId}/lifecycle-requests`,
  GET_FAMILY_LIFECYCLE_REQUESTS_API: (familyId) => BASE_URL + `/families/${familyId}/lifecycle-requests`,
  ADMIN_LIFECYCLE_REQUESTS_API: BASE_URL + "/families/admin/lifecycle-requests",
  REVIEW_LIFECYCLE_REQUEST_API: (requestId) => BASE_URL + `/families/admin/lifecycle-requests/${requestId}/review`,
  ADMIN_MERGE_FAMILIES_API: BASE_URL + "/families/admin/merge",
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
  PUBLICATION_VIEW_FILE_API: (publicationId) => BASE_URL + `/content/publications/${publicationId}/view-file`,
  PUBLICATION_DOWNLOAD_FILE_API: (publicationId) => BASE_URL + `/content/publications/${publicationId}/download-file`,
  MANAGEMENT_API: BASE_URL + "/content/management",
  ADMIN_MANAGEMENT_API: BASE_URL + "/content/admin/management",
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
  VIDEOS_API: BASE_URL + "/content/videos",
  ADMIN_VIDEOS_API: BASE_URL + "/content/admin/videos",
  VIDEO_API: (videoId) => BASE_URL + `/content/videos/${videoId}`,
  PUBLISH_VIDEO_API: (videoId) => BASE_URL + `/content/videos/${videoId}/publish`,
  UNPUBLISH_VIDEO_API: (videoId) => BASE_URL + `/content/videos/${videoId}/unpublish`,
  DELETE_VIDEO_API: (videoId) => BASE_URL + `/content/videos/${videoId}`,
}

export const opportunityEndpoints = {
  JOBS_API: BASE_URL + "/opportunities/jobs",
  ADMIN_JOBS_API: BASE_URL + "/opportunities/admin/jobs",
  UPDATE_JOB_API: (jobId) => BASE_URL + `/opportunities/jobs/${jobId}`,
  MODERATE_JOB_API: (jobId) => BASE_URL + `/opportunities/admin/jobs/${jobId}/moderate`,
  MY_JOBS_API: BASE_URL + "/opportunities/me/jobs",
  REPORT_JOB_API: (jobId) => BASE_URL + `/opportunities/jobs/${jobId}/report`,
  APPLY_JOB_API: (jobId) => BASE_URL + `/opportunities/jobs/${jobId}/applications`,
  JOB_APPLICATIONS_API: (jobId) => BASE_URL + `/opportunities/jobs/${jobId}/applications`,
  UPDATE_JOB_APPLICATION_STATUS_API: (applicationId) => BASE_URL + `/opportunities/job-applications/${applicationId}/status`,
  SCHOLARSHIPS_API: BASE_URL + "/opportunities/scholarships",
  ADMIN_SCHOLARSHIPS_API: BASE_URL + "/opportunities/admin/scholarships",
  SCHOLARSHIP_API: (scholarshipId) => BASE_URL + `/opportunities/scholarships/${scholarshipId}`,
  ARCHIVE_SCHOLARSHIP_API: (scholarshipId) => BASE_URL + `/opportunities/scholarships/${scholarshipId}/archive`,
  APPLY_SCHOLARSHIP_API: (scholarshipId) => BASE_URL + `/opportunities/scholarships/${scholarshipId}/applications`,
  MY_SCHOLARSHIP_APPLICATIONS_API: BASE_URL + "/opportunities/me/scholarship-applications",
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
  PUBLIC_SUPPORTERS_API: BASE_URL + "/payments/donations/supporters",
  MY_DONATIONS_API: BASE_URL + "/payments/me/donations",
  DONATION_RECEIPT_API: (donationId) => BASE_URL + `/payments/donations/${donationId}/receipt`,
  CONTRIBUTIONS_API: BASE_URL + "/payments/contributions",
  MY_CONTRIBUTIONS_API: BASE_URL + "/payments/me/contributions",
  MY_CONTRIBUTIONS_SUMMARY_API: BASE_URL + "/payments/me/contributions/summary",
  MY_FINANCIAL_HISTORY_API: BASE_URL + "/payments/me/financial-history",
  CREATE_CONTRIBUTION_ORDER_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/orders`,
  VERIFY_CONTRIBUTION_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/verify`,
  CONTRIBUTION_RECEIPT_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/receipt`,
  GENERATE_CONTRIBUTIONS_API: BASE_URL + "/payments/contributions/generate",
  CONTRIBUTION_CYCLES_API: BASE_URL + "/payments/contributions/cycles",
  UPDATE_CYCLE_STATUS_API: (cycleId) => BASE_URL + `/payments/contributions/cycles/${cycleId}/status`,
  CONTRIBUTIONS_DASHBOARD_SUMMARY_API: BASE_URL + "/payments/contributions/dashboard-summary",
  EXPORT_CONTRIBUTIONS_API: BASE_URL + "/payments/contributions/export",
  SEND_CONTRIBUTION_REMINDERS_API: BASE_URL + "/payments/contributions/reminders",
  MEMBER_LEDGER_ADMIN_API: (memberId) => BASE_URL + `/payments/contributions/members/${memberId}/ledger`,
  MARK_OVERDUE_CONTRIBUTIONS_API: BASE_URL + "/payments/contributions/mark-overdue",
  MANUAL_CONTRIBUTION_PAYMENT_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/payments/manual`,
  OFFLINE_CONTRIBUTION_PAYMENT_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/payments/offline`,
  REVERSE_CONTRIBUTION_PAYMENT_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/reverse`,
  WAIVE_CONTRIBUTION_API: (contributionId) => BASE_URL + `/payments/contributions/${contributionId}/waive`,
}

export const familyContributionEndpoints = {
  MY_FAMILY_SUMMARY_API: BASE_URL + "/payments/family-contributions/me",
  MY_FAMILY_HISTORY_API: BASE_URL + "/payments/family-contributions/me/history",
  GET_QUOTE_API: BASE_URL + "/payments/family-contributions/quote",
  PREPARE_PAYMENT_API: BASE_URL + "/payments/family-contributions/prepare-payment",
  VERIFY_PAYMENT_API: BASE_URL + "/payments/family-contributions/verify-payment",
  GET_RECEIPT_API: (paymentId) => BASE_URL + `/payments/family-contributions/receipt/${paymentId}`,

  // Admin APIs
  ADMIN_ACCOUNTS_API: BASE_URL + "/payments/admin/family-contributions",
  ADMIN_ACCOUNT_DETAIL_API: (familyId) => BASE_URL + `/payments/admin/family-contributions/${familyId}`,
  ADMIN_QUOTE_API: (familyId) => BASE_URL + `/payments/admin/family-contributions/${familyId}/quote`,
  RECORD_CASH_API: (familyId) => BASE_URL + `/payments/admin/family-contributions/${familyId}/cash`,
  WAIVE_FINE_API: (familyId) => BASE_URL + `/payments/admin/family-contributions/${familyId}/waive-fine`,
  RECORD_ADJUSTMENT_API: (familyId) => BASE_URL + `/payments/admin/family-contributions/${familyId}/adjustment`,
  RECONCILE_FAMILY_API: (familyId) => BASE_URL + `/payments/admin/family-contributions/${familyId}/reconcile`,
  RECONCILE_ALL_API: BASE_URL + "/payments/admin/family-contributions/reconcile-all",
  GET_SETTINGS_API: BASE_URL + "/payments/admin/family-contributions/settings",
  UPDATE_SETTINGS_API: BASE_URL + "/payments/admin/family-contributions/settings",
}

export const communityEndpoints = {
  DHARAMSHALAS_API: BASE_URL + "/dharamshala/properties",
  DHARAMSHALA_DETAIL_API: (id) => BASE_URL + `/dharamshala/properties/${id}`,
  ISSUES_API: BASE_URL + "/community/issues",
  UPDATE_ISSUE_STATUS_API: (issueId) => BASE_URL + `/community/issues/${issueId}/status`,
  ISSUE_RESPONSES_API: (issueId) => BASE_URL + `/community/issues/${issueId}/responses`,
  CONFIRM_ISSUE_RESOLUTION_API: (issueId) => BASE_URL + `/community/issues/${issueId}/confirm-resolution`,
  MY_DHARAMSHALA_BOOKINGS_API: BASE_URL + "/community/me/dharamshala/bookings",
  DHARAMSHALA_BOOKINGS_API: BASE_URL + "/community/dharamshala/bookings",
  REVIEW_DHARAMSHALA_BOOKING_API: (bookingId) => BASE_URL + `/community/dharamshala/bookings/${bookingId}/review`,
  UPDATE_DHARAMSHALA_BOOKING_LIFECYCLE_API: (bookingId) => BASE_URL + `/community/dharamshala/bookings/${bookingId}/lifecycle`,
  REFUND_DHARAMSHALA_PAYMENT_API: (paymentId) => BASE_URL + `/community/dharamshala/payments/${paymentId}/refund`,
  CANCEL_DHARAMSHALA_BOOKING_API: (bookingId) => BASE_URL + `/community/dharamshala/bookings/${bookingId}/cancel`,
  CREATE_DHARAMSHALA_PAYMENT_ORDER_API: (bookingId) => BASE_URL + `/community/dharamshala/bookings/${bookingId}/payment-order`,
  VERIFY_DHARAMSHALA_PAYMENT_API: BASE_URL + "/community/dharamshala/payments/verify",
  MY_DHARAMSHALA_PAYMENTS_API: BASE_URL + "/community/me/dharamshala/payments",
  DHARAMSHALA_AVAILABILITY_API: BASE_URL + "/community/dharamshala/availability",
  DHARAMSHALA_BLOCKED_DATES_API: BASE_URL + "/community/dharamshala/blocked-dates",
  ARCHIVE_DHARAMSHALA_BLOCKED_DATE_API: (blockId) => BASE_URL + `/community/dharamshala/blocked-dates/${blockId}/archive`,
  POLLS_API: BASE_URL + "/community/polls",
  UPDATE_POLL_STATUS_API: (pollId) => BASE_URL + `/community/polls/${pollId}/status`,
  POLL_RESULTS_API: (pollId) => BASE_URL + `/community/polls/${pollId}/results`,
  CAST_VOTE_API: (pollId) => BASE_URL + `/community/polls/${pollId}/votes`,
  VOTE_API: (pollId) => BASE_URL + `/community/polls/${pollId}/votes`,
  POSTS_API: BASE_URL + "/community/posts",
  POST_COMMENTS_API: (postId) => BASE_URL + `/community/posts/${postId}/comments`,
  REPORT_POST_API: (postId) => BASE_URL + `/community/posts/${postId}/reports`,
  COMMUNITY_REPORTS_API: BASE_URL + "/community/reports",
  REVIEW_COMMUNITY_REPORT_API: (reportId) => BASE_URL + `/community/reports/${reportId}`,
  ACHIEVEMENTS_API: BASE_URL + "/community/achievements",
  MY_ACHIEVEMENTS_API: BASE_URL + "/community/me/achievements",
  ADMIN_ACHIEVEMENTS_API: BASE_URL + "/community/admin/achievements",
  REVIEW_ACHIEVEMENT_API: (achievementId) => BASE_URL + `/community/achievements/${achievementId}/review`,
  SHRADHANJALIS_API: BASE_URL + "/community/shradhanjalis",
  MY_SHRADHANJALIS_API: BASE_URL + "/community/me/shradhanjalis",
  ADMIN_SHRADHANJALIS_API: BASE_URL + "/community/admin/shradhanjalis",
  REVIEW_SHRADHANJALI_API: (shradhanjaliId) => BASE_URL + `/community/shradhanjalis/${shradhanjaliId}/review`,
  SHRADHANJALI_SUPPORTING_DOCUMENT_API: (shradhanjaliId) => BASE_URL + `/community/admin/shradhanjalis/${shradhanjaliId}/supporting-document`,
  MEMBERSHIP_CARD_API: BASE_URL + "/community/membership-cards/me",
  VERIFY_MEMBERSHIP_CARD_API: (memberId) => BASE_URL + `/community/membership-cards/${memberId}/verify`,
  VERIFY_MEMBER_BY_TOKEN_API: (token) => BASE_URL + `/community/membership-cards/verify-token/${token}`,
  PUBLISH_ISSUE_SOLUTION_API: (issueId) => BASE_URL + `/community/issues/${issueId}/publish-solution`,
  PUBLIC_SOLUTIONS_API: BASE_URL + "/community/solutions",
}

export const notificationEndpoints = {
  NOTIFICATIONS_API: BASE_URL + "/notifications",
  MARK_NOTIFICATION_READ_API: (notificationId) => BASE_URL + `/notifications/${notificationId}/read`,
  MARK_ALL_NOTIFICATIONS_READ_API: BASE_URL + "/notifications/read-all",
}

export const matrimonialEndpoints = {
  FILTERS_API: BASE_URL + "/matrimonial/filters",
  MY_PROFILE_API: BASE_URL + "/matrimonial/profiles/me",
  PROFILE_VISIBILITY_API: BASE_URL + "/matrimonial/profiles/me/visibility",
  PROFILES_API: BASE_URL + "/matrimonial/profiles",
  PROFILE_API: (profileId) => BASE_URL + `/matrimonial/profiles/${profileId}`,
  EXPRESS_INTEREST_API: (profileId) => BASE_URL + `/matrimonial/profiles/${profileId}/interests`,
  MY_INTERESTS_API: BASE_URL + "/matrimonial/interests/me",
  RECEIVED_INTEREST_PROFILE_API: (interestId) => BASE_URL + `/matrimonial/interests/${interestId}/profile`,
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

export const suggestionEndpoints = {
  // Meta
  SUGGESTION_META_API: BASE_URL + "/suggestions/meta",
  // Member
  CREATE_SUGGESTION_API: BASE_URL + "/suggestions",
  MY_SUGGESTIONS_API: BASE_URL + "/suggestions/me",
  GET_SUGGESTION_API: (id) => BASE_URL + `/suggestions/${id}`,
  ADD_MEMBER_MESSAGE_API: (id) => BASE_URL + `/suggestions/${id}/messages`,
  DELETE_SUGGESTION_API: (id) => BASE_URL + `/suggestions/${id}`,
  // Admin
  ADMIN_LIST_SUGGESTIONS_API: BASE_URL + "/suggestions/admin/list",
  ADMIN_UPDATE_STATUS_API: (id) => BASE_URL + `/suggestions/${id}/status`,
  ADMIN_SET_PRIORITY_API: (id) => BASE_URL + `/suggestions/${id}/priority`,
  ADMIN_ASSIGN_API: (id) => BASE_URL + `/suggestions/${id}/assign`,
  ADMIN_REPLY_API: (id) => BASE_URL + `/suggestions/${id}/reply`,
  ADMIN_DELETE_SUGGESTION_API: (id) => BASE_URL + `/suggestions/${id}/admin-delete`,
}

export const dharamshalaAdminEndpoints = {
  // Amenities
  LIST_AMENITIES_API: BASE_URL + "/admin/dharamshala/amenities",
  CREATE_AMENITY_API: BASE_URL + "/admin/dharamshala/amenities",
  // Properties (Dharamshalas)
  LIST_PROPERTIES_API: BASE_URL + "/admin/dharamshala/properties",
  CREATE_PROPERTY_API: BASE_URL + "/admin/dharamshala/properties",
  GET_PROPERTY_API: (id) => BASE_URL + `/admin/dharamshala/properties/${id}`,
  UPDATE_PROPERTY_API: (id) => BASE_URL + `/admin/dharamshala/properties/${id}`,
  PUBLISH_PROPERTY_API: (id) => BASE_URL + `/admin/dharamshala/properties/${id}/publish`,
  ARCHIVE_PROPERTY_API: (id) => BASE_URL + `/admin/dharamshala/properties/${id}/archive`,
  // Photos
  UPLOAD_IMAGES_API: (id) => BASE_URL + `/admin/dharamshala/properties/${id}/images`,
  DELETE_IMAGE_API: (id, imageId) => BASE_URL + `/admin/dharamshala/properties/${id}/images/${imageId}`,
  // Room Types
  CREATE_ROOM_TYPE_API: (id) => BASE_URL + `/admin/dharamshala/properties/${id}/room-types`,
  UPLOAD_ROOM_TYPE_IMAGES_API: (id, rtId) => BASE_URL + `/admin/dharamshala/properties/${id}/room-types/${rtId}/images`,
  DELETE_ROOM_TYPE_IMAGE_API: (id, rtId, imageId) => BASE_URL + `/admin/dharamshala/properties/${id}/room-types/${rtId}/images/${imageId}`,
  UPDATE_ROOM_TYPE_API: (id, rtId) => BASE_URL + `/admin/dharamshala/properties/${id}/room-types/${rtId}`,
  DELETE_ROOM_TYPE_API: (id, rtId) => BASE_URL + `/admin/dharamshala/properties/${id}/room-types/${rtId}`,
  // Membership Claims (§5.9, §7.8)
  LIST_CLAIMS_API: BASE_URL + "/admin/dharamshala/claims",
  GET_CLAIM_DOCUMENT_API: (claimId) => BASE_URL + `/admin/dharamshala/claims/${claimId}/document`,
  REVIEW_CLAIM_API: (claimId) => BASE_URL + `/admin/dharamshala/claims/${claimId}/review`,
  REVOKE_CLAIM_API: (claimId) => BASE_URL + `/admin/dharamshala/claims/${claimId}/revoke`,
}

export const dharamshalaPublicEndpoints = {
  LIST_PROPERTIES_API: BASE_URL + "/dharamshala/properties",
  GET_PROPERTY_DETAIL_API: (idOrSlug) => BASE_URL + `/dharamshala/properties/${idOrSlug}`,
  CHECK_AVAILABILITY_API: (id) => BASE_URL + `/dharamshala/properties/${id}/availability`,
  GET_CALENDAR_API: (id) => BASE_URL + `/dharamshala/properties/${id}/calendar`,
  LIST_AMENITIES_API: BASE_URL + "/community/dharamshalas/amenities",
  // Auth & Membership Claims (§9.1, §7.8)
  GOOGLE_AUTH_API: BASE_URL + "/auth/google",
  UPDATE_PHONE_API: BASE_URL + "/dharamshala/me/phone",
  GET_ME_API: BASE_URL + "/dharamshala/me",
  SUBMIT_CLAIM_API: BASE_URL + "/dharamshala/claims",
  GET_MY_CLAIM_API: BASE_URL + "/dharamshala/claims/me",
}

// ── Phase 4-7: Booking Engine v2 Endpoints ──────────────────────────────────
export const dharamshalaBookingV2Endpoints = {
  // Booking (Phase 4)
  QUOTE_API:           BASE_URL + "/dharamshala/bookings/quote",
  CREATE_BOOKING_API:  BASE_URL + "/dharamshala/bookings",
  MY_BOOKINGS_API:     BASE_URL + "/dharamshala/bookings/my",
  GET_BOOKING_API:     (id) => BASE_URL + `/dharamshala/bookings/${id}`,
  GET_ID_DOCUMENT_API:(id) => BASE_URL + `/dharamshala/bookings/${id}/id-document`,
  GET_GUEST_AADHAAR_API:(id, guestNumber) => BASE_URL + `/dharamshala/bookings/${id}/guest-documents/${guestNumber}`,
  CANCEL_BOOKING_API:  (id) => BASE_URL + `/dharamshala/bookings/${id}/cancel`,

  // Payment (Phase 5)
  CREATE_ORDER_API:    (id) => BASE_URL + `/dharamshala/payments/${id}/pay`,
  VERIFY_PAYMENT_API:  (id) => BASE_URL + `/dharamshala/payments/${id}/pay/verify`,
  GET_LEDGER_API:      (id) => BASE_URL + `/dharamshala/payments/${id}/ledger`,
  GET_RECEIPT_API:     (id, ledgerId) => BASE_URL + `/dharamshala/payments/${id}/receipt${ledgerId ? `?ledgerId=${encodeURIComponent(ledgerId)}` : ""}`,

  // Admin Booking Management
  ADMIN_LIST_BOOKINGS_API:   BASE_URL + "/dharamshala/bookings/admin/list",
  ADMIN_APPROVE_BOOKING_API: (id) => BASE_URL + `/dharamshala/bookings/admin/${id}/approve`,
  ADMIN_REJECT_BOOKING_API:  (id) => BASE_URL + `/dharamshala/bookings/admin/${id}/reject`,
  ADMIN_CHECKIN_API:         (id) => BASE_URL + `/dharamshala/bookings/admin/${id}/checkin`,
  ADMIN_CHECKOUT_API:        (id) => BASE_URL + `/dharamshala/bookings/admin/${id}/checkout`,
  ADMIN_COLLECT_API:         (id) => BASE_URL + `/dharamshala/payments/${id}/collect`,
  ADMIN_REFUND_API:          (id) => BASE_URL + `/dharamshala/payments/${id}/refund`,

  // Staff Panel (Phase 6)
  STAFF_TODAY_API:     BASE_URL + "/dharamshala/staff/today",
  STAFF_SEARCH_API:    BASE_URL + "/dharamshala/staff/search",
  STAFF_WALKIN_API:    BASE_URL + "/dharamshala/staff/walkin",
  STAFF_CHECKIN_API:   (id) => BASE_URL + `/dharamshala/staff/${id}/checkin`,
  STAFF_CHECKOUT_API:  (id) => BASE_URL + `/dharamshala/staff/${id}/checkout`,
  STAFF_NOSHOW_API:    (id) => BASE_URL + `/dharamshala/staff/${id}/noshow`,

  // Reports (Phase 7)
  REPORT_BOOKINGS_API: BASE_URL + "/dharamshala/admin/reports/bookings",
  REPORT_REVENUE_API:  BASE_URL + "/dharamshala/admin/reports/revenue",
  REPORT_AUDIT_API:    BASE_URL + "/dharamshala/admin/reports/audit",
}
