import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let mockRouter: Partial<Router>;
  let mockAuthService: Partial<AuthService>;
  let formBuilder: FormBuilder;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    mockRouter = { navigate: vi.fn() };
    mockAuthService = { register: vi.fn() };
    const mockCdr = { detectChanges: vi.fn() };

    component = new RegisterComponent(formBuilder, mockRouter as Router, mockAuthService as AuthService, mockCdr as any);
  });

  describe('Form Initialization', () => {
    it('should initialize register form with email, password, role', () => {
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('email')).toBeDefined();
      expect(component.registerForm.get('password')).toBeDefined();
      expect(component.registerForm.get('role')).toBeDefined();
    });

    it('should have form as invalid when empty', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      expect(component.isFieldInvalid('email')).toBeTruthy();
    });

    it('should validate password min length', () => {
      const passwordControl = component.registerForm.get('password');
      passwordControl?.setValue('12345');
      passwordControl?.markAsTouched();
      expect(component.isFieldInvalid('password')).toBeTruthy();
    });

    it('should validate role is required', () => {
      const roleControl = component.registerForm.get('role');
      roleControl?.setValue('');
      roleControl?.markAsTouched();
      expect(component.isFieldInvalid('role')).toBeTruthy();
    });

    it('should be valid with correct data', () => {
      component.registerForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        role: 'reporter'
      });
      expect(component.registerForm.valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.onSubmit();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register on valid form', () => {
      (mockAuthService.register as any).mockResolvedValue({ success: true, message: 'OK' });
      component.registerForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        role: 'reporter'
      });

      component.onSubmit();

      expect(mockAuthService.register).toHaveBeenCalledWith('test@test.com', 'password123', 'reporter');
    });

    it('should set isSubmitting during registration', () => {
      (mockAuthService.register as any).mockResolvedValue({ success: true, message: 'OK' });
      component.registerForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        role: 'reporter'
      });

      component.onSubmit();

      expect(component.isSubmitting).toBe(true);
    });

    it('should set registerSuccess and navigate on successful registration', async () => {
      vi.useFakeTimers();
      (mockAuthService.register as any).mockResolvedValue({ success: true, message: 'OK' });
      component.registerForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        role: 'reporter'
      });

      component.onSubmit();
      await vi.runAllTimersAsync();

      expect(component.registerSuccess).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      vi.useRealTimers();
    });

    it('should display error on failed registration', async () => {
      (mockAuthService.register as any).mockResolvedValue({ success: false, message: 'Email already exists' });
      component.registerForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        role: 'reporter'
      });

      component.onSubmit();
      await new Promise(process.nextTick);

      expect(component.registerError).toBe('Email already exists');
      expect(component.isSubmitting).toBe(false);
    });

    it('should use default error message when none provided', async () => {
      (mockAuthService.register as any).mockResolvedValue({ success: false });
      component.registerForm.patchValue({
        email: 'test@test.com',
        password: 'password123',
        role: 'reporter'
      });

      component.onSubmit();
      await new Promise(process.nextTick);

      expect(component.registerError).toContain('Error al crear la cuenta');
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page', () => {
      component.navigateToLogin();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
