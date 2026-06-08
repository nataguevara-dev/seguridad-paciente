import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let formBuilder: FormBuilder;
  let mockRouter: Partial<Router>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    mockRouter = {
      navigate: vi.fn()
    };
    mockAuthService = {
      login: vi.fn()
    };

    const mockCdr = { detectChanges: vi.fn() };
    component = new LoginComponent(formBuilder, mockRouter as Router, mockAuthService as AuthService, mockCdr as any);
  });

  describe('Form Initialization', () => {
    it('should initialize the login form', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('email')).toBeDefined();
      expect(component.loginForm.get('password')).toBeDefined();
    });

    it('should have form as invalid when empty', () => {
      expect(component.loginForm.valid).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.loginForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();

      expect(component.isFieldInvalid('email')).toBeTruthy();
    });

    it('should validate password is required', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('');
      passwordControl?.markAsTouched();

      expect(component.isFieldInvalid('password')).toBeTruthy();
    });
  });

  describe('Login Submission', () => {
    it('should not submit invalid form', () => {
      component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should submit valid form', async () => {
      (mockAuthService.login as any).mockResolvedValue({
        success: true,
        message: 'Login successful'
      });

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should navigate to dashboard on successful login', async () => {
      (mockAuthService.login as any).mockResolvedValue({
        success: true,
        message: 'Login successful'
      });

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'password123'
      });

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });

    it('should display error on failed login', async () => {
      (mockAuthService.login as any).mockResolvedValue({
        success: false,
        message: 'Invalid credentials'
      });

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      await component.onSubmit();

      expect(component.loginError).toBe('Invalid credentials');
      expect(component.isSubmitting).toBeFalsy();
    });

    it('should show default error when login response has no message', async () => {
      (mockAuthService.login as any).mockResolvedValue({ success: false });

      component.loginForm.patchValue({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      await component.onSubmit();

      expect(component.loginError).toContain('Error al iniciar sesión');
      expect(component.isSubmitting).toBeFalsy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to register page', () => {
      component.navigateToRegister();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/register']);
    });

    it('should navigate to recover page', () => {
      component.navigateToRecover();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/recover']);
    });
  });
});
