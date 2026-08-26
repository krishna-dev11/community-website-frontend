import { useCallback, useState } from "react";

export function getErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  const status = error?.response?.status;
  const serverMessage = error?.response?.data?.message;

  if (!error?.response) {
    return "Unable to connect to server. Please check your internet connection.";
  }
  if (status === 401) return serverMessage || "Your session has expired. Please login again.";
  if (status === 403) return serverMessage || "You are not authorized to perform this action.";
  if (status === 500) return "Something went wrong on the server. Please try again later.";
  return serverMessage || fallback;
}

/**
 * Reusable async submit guard — prevents duplicate requests and tracks success briefly.
 */
export function useSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const runSubmit = useCallback(async (fn, { resetSuccessMs = 2500 } = {}) => {
    if (isSubmitting) return null;
    setIsSubmitting(true);
    setSuccess(false);
    try {
      const result = await fn();
      setSuccess(true);
      if (resetSuccessMs > 0) {
        window.setTimeout(() => setSuccess(false), resetSuccessMs);
      }
      return result;
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting]);

  return { isSubmitting, success, setSuccess, setIsSubmitting, runSubmit };
}

export default useSubmitState;
