// Form validation utilities

export const validators = {
  required: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : 'Invalid email address';
  },

  walletAddress: (value) => {
    if (!value) return null;
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    return walletRegex.test(value) ? null : 'Invalid wallet address';
  },

  number: (value, fieldName = 'Value') => {
    if (!value) return null;
    const num = parseFloat(value);
    return !isNaN(num) && isFinite(num) ? null : `${fieldName} must be a valid number`;
  },

  positiveNumber: (value, fieldName = 'Value') => {
    const numError = validators.number(value, fieldName);
    if (numError) return numError;
    return parseFloat(value) > 0 ? null : `${fieldName} must be greater than 0`;
  },

  minValue: (min) => (value, fieldName = 'Value') => {
    const numError = validators.number(value, fieldName);
    if (numError) return numError;
    return parseFloat(value) >= min ? null : `${fieldName} must be at least ${min}`;
  },

  maxValue: (max) => (value, fieldName = 'Value') => {
    const numError = validators.number(value, fieldName);
    if (numError) return numError;
    return parseFloat(value) <= max ? null : `${fieldName} must be at most ${max}`;
  },

  minLength: (min) => (value, fieldName = 'This field') => {
    if (!value) return null;
    return value.length >= min ? null : `${fieldName} must be at least ${min} characters`;
  },

  maxLength: (max) => (value, fieldName = 'This field') => {
    if (!value) return null;
    return value.length <= max ? null : `${fieldName} must be at most ${max} characters`;
  },

  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? null : 'Invalid date';
  },

  futureDate: (value, fieldName = 'Date') => {
    const dateError = validators.date(value);
    if (dateError) return dateError;
    const date = new Date(value);
    return date > new Date() ? null : `${fieldName} must be in the future`;
  },

  fileSize: (maxSizeInMB) => (file) => {
    if (!file) return null;
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes ? null : `File size must be less than ${maxSizeInMB}MB`;
  },

  fileType: (allowedTypes) => (file) => {
    if (!file) return null;
    const fileType = file.type;
    return allowedTypes.includes(fileType) ? null : `File type must be one of: ${allowedTypes.join(', ')}`;
  }
};

export const validateForm = (values, rules) => {
  const errors = {};
  
  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = values[field];
    const fieldValidators = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    
    for (const validator of fieldValidators) {
      const error = validator(value, field);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (value, type = 'text') => {
  if (!value) return value;
  
  switch (type) {
    case 'number':
      return parseFloat(value) || 0;
    case 'text':
      return String(value).trim();
    case 'walletAddress':
      return String(value).trim().toLowerCase();
    default:
      return value;
  }
};

export const validateFileSize = (file, maxSizeInMB = 5) => {
  if (!file) return { valid: true };
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeInMB}MB`
    };
  }
  return { valid: true };
};

export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']) => {
  if (!file) return { valid: true };
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type must be one of: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`
    };
  }
  return { valid: true };
};

export const validateTradeOffer = (offerData) => {
  const errors = {};

  if (!offerData.offer_type) {
    errors.offer_type = 'Offer type is required';
  }

  if (!offerData.token_symbol) {
    errors.token_symbol = 'Token is required';
  }

  if (!offerData.amount || offerData.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!offerData.price_per_unit || offerData.price_per_unit <= 0) {
    errors.price_per_unit = 'Price must be greater than 0';
  }

  if (!offerData.fiat_currency) {
    errors.fiat_currency = 'Fiat currency is required';
  }

  if (!offerData.payment_methods || offerData.payment_methods.length === 0) {
    errors.payment_methods = 'At least one payment method is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateKYCData = (kycData) => {
  const errors = {};

  if (!kycData.full_name || !kycData.full_name.trim()) {
    errors.full_name = 'Full name is required';
  }

  if (!kycData.date_of_birth) {
    errors.date_of_birth = 'Date of birth is required';
  }

  if (!kycData.country) {
    errors.country = 'Country is required';
  }

  if (!kycData.document_type) {
    errors.document_type = 'Document type is required';
  }

  if (!kycData.document_number || !kycData.document_number.trim()) {
    errors.document_number = 'Document number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};