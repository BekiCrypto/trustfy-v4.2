import { toast } from "sonner";

export const handleError = (error, context = '') => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  const message = getErrorMessage(error);
  toast.error(message);
  
  return message;
};

export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Network errors
  if (error.message === 'Failed to fetch' || error.message === 'Network request failed') {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Timeout errors
  if (error.message?.includes('timeout')) {
    return 'Request timed out. Please try again.';
  }
  
  // API errors
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  // Base44 SDK errors
  if (error.message) {
    return error.message;
  }
  
  // String errors
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Something went wrong. Please try again.';
};

export const handleSuccess = (message, description) => {
  toast.success(message, { description });
};

export const handleWarning = (message, description) => {
  toast.warning(message, { description });
};

export const handleInfo = (message, description) => {
  toast.info(message, { description });
};

export const withErrorHandling = (fn, context) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  };
};

export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
};