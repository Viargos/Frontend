import { IValidationService, ValidationResult } from '@/lib/interfaces/auth.interface';

export class ValidationService implements IValidationService {
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly USERNAME_MIN_LENGTH = 3;
  private readonly USERNAME_MAX_LENGTH = 30;
  private readonly PASSWORD_MIN_LENGTH = 6;
  private readonly OTP_LENGTH = 6;
  private readonly OTP_REGEX = /^\d{6}$/;

  validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false;
    }
    return this.EMAIL_REGEX.test(email.trim());
  }

  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!password || typeof password !== 'string') {
      errors.push('Password is required');
      return { isValid: false, errors };
    }

    if (password.length < this.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${this.PASSWORD_MIN_LENGTH} characters`);
    }

    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateUsername(username: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!username || typeof username !== 'string') {
      errors.push('Username is required');
      return { isValid: false, errors };
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername.length < this.USERNAME_MIN_LENGTH) {
      errors.push(`Username must be at least ${this.USERNAME_MIN_LENGTH} characters`);
    }

    if (trimmedUsername.length > this.USERNAME_MAX_LENGTH) {
      errors.push(`Username must not exceed ${this.USERNAME_MAX_LENGTH} characters`);
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      errors.push('Username can only contain letters, numbers, underscores, and hyphens');
    }

    if (/^[_-]/.test(trimmedUsername) || /[_-]$/.test(trimmedUsername)) {
      errors.push('Username cannot start or end with underscore or hyphen');
    }

    return { isValid: errors.length === 0, errors };
  }

  validateOtp(otp: string): boolean {
    if (!otp || typeof otp !== 'string') {
      return false;
    }
    
    return this.OTP_REGEX.test(otp.trim());
  }

  validatePhoneNumber(phoneNumber: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!phoneNumber) {
      return { isValid: true, errors }; // Phone number is optional
    }

    if (typeof phoneNumber !== 'string') {
      errors.push('Phone number must be a string');
      return { isValid: false, errors };
    }

    const cleanedPhone = phoneNumber.replace(/\D/g, '');

    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      errors.push('Phone number must be between 10 and 15 digits');
    }

    return { isValid: errors.length === 0, errors };
  }
}

// Singleton instance
export const validationService = new ValidationService();
