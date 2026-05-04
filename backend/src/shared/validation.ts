export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
    this.name = 'ValidationError';
  }
}

export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateRequired(value: any, fieldName: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (value === null || value === undefined || value === '') {
    errors.push({ field: fieldName, message: `${fieldName} is required` });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateStringLength(value: string, fieldName: string, min: number, max: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof value !== 'string') {
    errors.push({ field: fieldName, message: `${fieldName} must be a string` });
  } else if (value.length < min) {
    errors.push({ field: fieldName, message: `${fieldName} must be at least ${min} characters` });
  } else if (value.length > max) {
    errors.push({ field: fieldName, message: `${fieldName} must be at most ${max} characters` });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const allErrors = results.flatMap(r => r.errors);
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

export function createErrorResponse(message: string, statusCode: number = 400) {
  return {
    success: false,
    message,
    statusCode
  };
}

export function createSuccessResponse(data: any, message: string = 'Success') {
  return {
    success: true,
    message,
    data
  };
}