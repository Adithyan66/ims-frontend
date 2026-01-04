export const validators = {
  required: (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return '';
  },

  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  },

  positiveNumber: (value) => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return 'Please enter a positive number';
    }
    return '';
  },

  mobileNumber: (value) => {
    const mobileRegex = /^[0-9]{10}$/;
    if (value && !mobileRegex.test(value)) {
      return 'Please enter a valid 10-digit mobile number';
    }
    return '';
  },

  maxQuantity: (maxValue) => (value) => {
    const num = Number(value);
    if (isNaN(num) || num > maxValue) {
      return `Quantity cannot exceed ${maxValue}`;
    }
    return '';
  }
};

