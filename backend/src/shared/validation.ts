export class ValidationError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ field: string; message: string }>;
}

export function validateRequired(value: any, field: string): ValidationResult {
  if (value === undefined || value === null || value === '') {
    return { isValid: false, errors: [{ field, message: `${field} is required` }] };
  }
  return { isValid: true, errors: [] };
}

export function validateStringLength(value: string, field: string, min: number, max: number): ValidationResult {
  if (typeof value !== 'string') {
    return { isValid: false, errors: [{ field, message: `${field} must be a string` }] };
  }
  if (value.length < min || value.length > max) {
    return { isValid: false, errors: [{ field, message: `${field} must be between ${min} and ${max} characters` }] };
  }
  return { isValid: true, errors: [] };
}

export function validateEmail(value: string): ValidationResult {
  if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { isValid: false, errors: [{ field: 'email', message: 'Invalid email address' }] };
  }
  return { isValid: true, errors: [] };
}

export function combineValidations(...results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap(result => result.errors);
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function createErrorResponse(message: string, statusCode = 500) {
  return { success: false, message, statusCode };
}

export function createSuccessResponse(data: any, message = 'Success') {
  return { success: true, message, data };
}
