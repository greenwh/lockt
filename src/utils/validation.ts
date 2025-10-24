// src/utils/validation.ts

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email) return { isValid: true }; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return {
    isValid: emailRegex.test(email),
    error: emailRegex.test(email) ? undefined : 'Invalid email format',
  };
};

/**
 * Validate phone number (US format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) return { isValid: true }; // Optional field
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 10 || digits.length === 11;
  return {
    isValid,
    error: isValid ? undefined : 'Phone number must be 10-11 digits',
  };
};

/**
 * Validate URL format
 */
export const validateURL = (url: string): ValidationResult => {
  if (!url) return { isValid: true }; // Optional field
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate credit card number (Luhn algorithm)
 */
export const validateCreditCardNumber = (cardNumber: string): ValidationResult => {
  if (!cardNumber) return { isValid: false, error: 'Card number is required' };

  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');

  // Check if it's all digits
  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Card number must contain only digits' };
  }

  // Check length (most cards are 13-19 digits, commonly 16)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return { isValid: false, error: 'Card number must be 13-19 digits' };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const isValid = sum % 10 === 0;
  return {
    isValid,
    error: isValid ? undefined : 'Invalid card number',
  };
};

/**
 * Validate credit card expiration date (MM/YY format)
 */
export const validateExpirationDate = (expDate: string): ValidationResult => {
  if (!expDate) return { isValid: false, error: 'Expiration date is required' };

  const regex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
  if (!regex.test(expDate)) {
    return { isValid: false, error: 'Format must be MM/YY' };
  }

  const [month, year] = expDate.split('/');
  const expiry = new Date(2000 + parseInt(year, 10), parseInt(month, 10) - 1);
  const now = new Date();

  if (expiry < now) {
    return { isValid: false, error: 'Card has expired' };
  }

  return { isValid: true };
};

/**
 * Validate CSC/CVV code
 */
export const validateCSC = (csc: string): ValidationResult => {
  if (!csc) return { isValid: false, error: 'CSC is required' };

  const cleaned = csc.replace(/\s/g, '');
  const isValid = /^\d{3,4}$/.test(cleaned);

  return {
    isValid,
    error: isValid ? undefined : 'CSC must be 3-4 digits',
  };
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): ValidationResult => {
  if (!password) return { isValid: false, error: 'Password is required' };

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' };
  }

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

  if (strength < 2) {
    return {
      isValid: false,
      error: 'Password should contain uppercase, lowercase, numbers, and special characters',
    };
  }

  return { isValid: true };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string = 'This field'): ValidationResult => {
  const isValid = !!(value && value.trim().length > 0);
  return {
    isValid,
    error: isValid ? undefined : `${fieldName} is required`,
  };
};

/**
 * Validate account number (generic - alphanumeric)
 */
export const validateAccountNumber = (accountNumber: string): ValidationResult => {
  if (!accountNumber) return { isValid: true }; // Optional field

  const isValid = /^[a-zA-Z0-9-]+$/.test(accountNumber);
  return {
    isValid,
    error: isValid ? undefined : 'Account number can only contain letters, numbers, and hyphens',
  };
};

/**
 * Validate routing number (US - 9 digits)
 */
export const validateRoutingNumber = (routingNumber: string): ValidationResult => {
  if (!routingNumber) return { isValid: true }; // Optional field

  const cleaned = routingNumber.replace(/\D/g, '');
  const isValid = cleaned.length === 9;

  return {
    isValid,
    error: isValid ? undefined : 'Routing number must be 9 digits',
  };
};

/**
 * Validate wallet address (basic format check)
 */
export const validateWalletAddress = (address: string, type: 'ETH' | 'BTC' | 'SOL' | 'Other'): ValidationResult => {
  if (!address) return { isValid: true }; // Optional field

  switch (type) {
    case 'ETH':
      // Ethereum addresses start with 0x and are 42 characters
      const isValidETH = /^0x[a-fA-F0-9]{40}$/.test(address);
      return {
        isValid: isValidETH,
        error: isValidETH ? undefined : 'Invalid Ethereum address format',
      };

    case 'BTC':
      // Bitcoin addresses are typically 26-35 characters
      const isValidBTC = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || /^bc1[a-z0-9]{39,59}$/.test(address);
      return {
        isValid: isValidBTC,
        error: isValidBTC ? undefined : 'Invalid Bitcoin address format',
      };

    case 'SOL':
      // Solana addresses are base58 encoded and typically 32-44 characters
      const isValidSOL = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      return {
        isValid: isValidSOL,
        error: isValidSOL ? undefined : 'Invalid Solana address format',
      };

    default:
      // For other cryptocurrencies, just check it's alphanumeric
      const isValid = /^[a-zA-Z0-9]+$/.test(address);
      return {
        isValid,
        error: isValid ? undefined : 'Invalid wallet address format',
      };
  }
};

/**
 * Format phone number for display (US format)
 */
export const formatPhoneNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11) {
    return `+${digits[0]} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return phone;
};

/**
 * Format credit card number for display (mask middle digits)
 */
export const formatCreditCardNumber = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length >= 4) {
    const lastFour = cleaned.slice(-4);
    return `**** **** **** ${lastFour}`;
  }
  return cardNumber;
};
