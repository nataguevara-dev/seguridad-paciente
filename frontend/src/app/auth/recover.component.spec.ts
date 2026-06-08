import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RecoverComponent } from './recover.component';

describe('RecoverComponent', () => {
  let component: RecoverComponent;
  let mockRouter: Partial<Router>;
  let formBuilder: FormBuilder;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    mockRouter = { navigate: vi.fn() };
    const mockCdr = { detectChanges: vi.fn() };

    component = new RecoverComponent(formBuilder, mockRouter as Router, mockCdr as any);
  });

  describe('Form Initialization', () => {
    it('should initialize recover form with email field', () => {
      expect(component.recoverForm).toBeDefined();
      expect(component.recoverForm.get('email')).toBeDefined();
    });

    it('should have form invalid when email is empty', () => {
      expect(component.recoverForm.valid).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate email format', () => {
      const emailControl = component.recoverForm.get('email');
      emailControl?.setValue('invalid-email');
      emailControl?.markAsTouched();
      expect(component.isFieldInvalid('email')).toBeTruthy();
    });

    it('should be valid with correct email', () => {
      component.recoverForm.patchValue({ email: 'test@test.com' });
      expect(component.recoverForm.valid).toBeTruthy();
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      component.onSubmit();
      expect(component.isSubmitting).toBe(false);
    });

    it('should set isSubmitting on valid form submission', () => {
      component.recoverForm.patchValue({ email: 'test@test.com' });
      component.onSubmit();
      expect(component.isSubmitting).toBe(true);
    });

    it('should set recoverSuccess after recovery completes', async () => {
      vi.useFakeTimers();
      component.recoverForm.patchValue({ email: 'test@test.com' });

      component.onSubmit();
      await vi.runAllTimersAsync();

      expect(component.recoverSuccess).toBe(true);
      expect(component.isSubmitting).toBe(true);
      vi.useRealTimers();
    });
  });

  describe('Navigation', () => {
    it('should navigate to login page', () => {
      component.navigateToLogin();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });

    it('should navigate to register page', () => {
      component.navigateToRegister();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/register']);
    });
  });
});
