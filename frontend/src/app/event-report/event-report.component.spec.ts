import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { API_EVENTS_URL } from '../config';
import { EventReportComponent } from './event-report.component';

describe('EventReportComponent', () => {
  let component: EventReportComponent;
  let formBuilder: FormBuilder;
  let mockRouter: Partial<Router>;

  beforeEach(() => {
    formBuilder = new FormBuilder();
    mockRouter = {
      navigate: vi.fn()
    };
    const mockCdr = { detectChanges: vi.fn() };

    component = new EventReportComponent(formBuilder, mockRouter as Router, mockCdr as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Form Initialization', () => {
    it('should initialize the event form with proper structure', () => {
      expect(component.eventForm).toBeDefined();
      expect(component.eventForm.get('patientFirstName')).toBeDefined();
      expect(component.eventForm.get('patientLastName')).toBeDefined();
      expect(component.eventForm.get('clinicalHistoryNumber')).toBeDefined();
      expect(component.eventForm.get('documentType')).toBeDefined();
      expect(component.eventForm.get('documentNumber')).toBeDefined();
      expect(component.eventForm.get('birthDate')).toBeDefined();
      expect(component.eventForm.get('service')).toBeDefined();
      expect(component.eventForm.get('location')).toBeDefined();
      expect(component.eventForm.get('occurredAt')).toBeDefined();
      expect(component.eventForm.get('description')).toBeDefined();
    });

    it('should have form as invalid when empty', () => {
      expect(component.eventForm.valid).toBeFalsy();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      const firstNameControl = component.eventForm.get('patientFirstName');
      firstNameControl?.setValue('');
      firstNameControl?.markAsTouched();

      expect(component.hasFieldError('patientFirstName')).toBeTruthy();
    });

    it('should validate minimum length for names', () => {
      const control = component.eventForm.get('patientFirstName');
      control?.setValue('A');
      control?.markAsTouched();

      expect(component.hasFieldError('patientFirstName')).toBeTruthy();
    });

    it('should validate numeric fields', () => {
      const control = component.eventForm.get('clinicalHistoryNumber');
      control?.setValue('ABC');
      control?.markAsTouched();

      expect(component.hasFieldError('clinicalHistoryNumber')).toBeTruthy();
    });

    it('should validate description length', () => {
      const control = component.eventForm.get('description');
      control?.setValue('short');
      control?.markAsTouched();

      expect(component.hasFieldError('description')).toBeTruthy();
    });
  });

  describe('getFieldError', () => {
    it('should return empty string when control has no errors', () => {
      const result = component.getFieldError('patientFirstName');
      expect(result).toBe('');
    });

    it('should return required message for required error', () => {
      const control = component.eventForm.get('patientFirstName');
      control?.setValue('');
      control?.markAsTouched();

      const result = component.getFieldError('patientFirstName');
      expect(result).toBe('Este campo es obligatorio');
    });

    it('should return minlength message', () => {
      const control = component.eventForm.get('patientFirstName');
      control?.setValue('A');
      control?.markAsTouched();

      const result = component.getFieldError('patientFirstName');
      expect(result).toContain('Mínimo');
    });

    it('should return pattern message for clinicalHistoryNumber', () => {
      const control = component.eventForm.get('clinicalHistoryNumber');
      control?.setValue('ABC');
      control?.markAsTouched();

      const result = component.getFieldError('clinicalHistoryNumber');
      expect(result).toBe('Solo números permitidos');
    });

    it('should return pattern message for description (non-numeric field)', () => {
      const control = component.eventForm.get('description');
      control?.setValue('');
      control?.markAsTouched();
      component.eventForm.get('description')?.setErrors({ pattern: true });

      const result = component.getFieldError('description');
      expect(result).toBe('Formato inválido');
    });

    it('should return maxlength message', () => {
      const control = component.eventForm.get('description');
      control?.setValue('');
      control?.markAsTouched();
      component.eventForm.get('description')?.setErrors({ maxlength: { requiredLength: 1000, actualLength: 1001 } });

      const result = component.getFieldError('description');
      expect(result).toContain('Máximo 1000 caracteres');
    });
  });

  describe('Form Submission', () => {
    it('should not submit invalid form', () => {
      const submitSpy = vi.fn();
      (component as any).submitEvent = submitSpy;
      component.eventForm.markAllAsTouched();

      component.onSubmit();

      expect(submitSpy).not.toHaveBeenCalled();
    });

    it('should submit valid form', async () => {
      const submitSpy = vi.fn();
      (component as any).submitEvent = submitSpy;

      component.eventForm.patchValue({
        patientFirstName: 'John',
        patientLastName: 'Doe',
        clinicalHistoryNumber: '12345',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '1234567890',
        birthDate: '1990-01-01',
        service: 'Urgencias',
        location: 'Hospital Central',
        occurredAt: '2026-05-04T10:00',
        description: 'This is a detailed description of the safety event that occurred'
      });

      component.onSubmit();

      expect(submitSpy).toHaveBeenCalled();
    });

    it('should set isSubmitting flag during submission', () => {
      const submitSpy = vi.fn();
      (component as any).submitEvent = submitSpy;

      component.eventForm.patchValue({
        patientFirstName: 'John',
        patientLastName: 'Doe',
        clinicalHistoryNumber: '12345',
        documentType: 'Cédula de ciudadanía',
        documentNumber: '1234567890',
        birthDate: '1990-01-01',
        service: 'Urgencias',
        location: 'Hospital Central',
        occurredAt: '2026-05-04T10:00',
        description: 'This is a detailed description of the safety event that occurred'
      });

      component.onSubmit();

      expect(component.isSubmitting).toBeTruthy();
    });
  });

  describe('submitEvent (private)', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should show error when no auth token', async () => {
      const mockCdr = { detectChanges: vi.fn() };
      component = new EventReportComponent(formBuilder, mockRouter as Router, mockCdr as any);

      await (component as any).submitEvent({
        patient: { firstName: 'Test', lastName: 'User', clinicalHistoryNumber: '12345', documentType: 'CC', documentNumber: '123', birthDate: '1990-01-01' },
        service: 'Urgencias', location: 'Central', occurredAt: '2026-05-04T10:00', description: 'Test event description'
      });

      expect(component.submitError).toContain('No authentication token');
      expect(component.isSubmitting).toBe(false);
    });

    it('should POST event and navigate on success', async () => {
      vi.useFakeTimers();
      localStorage.setItem('auth_token', 'test-token');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) } as any);

      await (component as any).submitEvent({
        patient: { firstName: 'Test', lastName: 'User', clinicalHistoryNumber: '12345', documentType: 'CC', documentNumber: '123', birthDate: '1990-01-01' },
        service: 'Urgencias', location: 'Central', occurredAt: '2026-05-04T10:00', description: 'Test event description'
      });

      expect(component.submitSuccess).toBe(true);
      expect(fetch).toHaveBeenCalledWith(API_EVENTS_URL, expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer test-token' }
      }));
      vi.runAllTimers();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
      vi.useRealTimers();
    });

    it('should handle API error response', async () => {
      localStorage.setItem('auth_token', 'test-token');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ message: 'Bad request' })
      } as any);

      await (component as any).submitEvent({
        patient: { firstName: 'Test', lastName: 'User', clinicalHistoryNumber: '12345', documentType: 'CC', documentNumber: '123', birthDate: '1990-01-01' },
        service: 'Urgencias', location: 'Central', occurredAt: '2026-05-04T10:00', description: 'Test event description'
      });

      expect(component.submitError).toBe('Bad request');
      expect(component.isSubmitting).toBe(false);
    });

    it('should use default error message when API returns no message', async () => {
      localStorage.setItem('auth_token', 'test-token');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({})
      } as any);

      await (component as any).submitEvent({
        patient: { firstName: 'Test', lastName: 'User', clinicalHistoryNumber: '12345', documentType: 'CC', documentNumber: '123', birthDate: '1990-01-01' },
        service: 'Urgencias', location: 'Central', occurredAt: '2026-05-04T10:00', description: 'Test event description'
      });

      expect(component.submitError).toContain('Error al enviar el reporte');
      expect(component.isSubmitting).toBe(false);
    });

    it('should handle network error', async () => {
      localStorage.setItem('auth_token', 'test-token');
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      await (component as any).submitEvent({
        patient: { firstName: 'Test', lastName: 'User', clinicalHistoryNumber: '12345', documentType: 'CC', documentNumber: '123', birthDate: '1990-01-01' },
        service: 'Urgencias', location: 'Central', occurredAt: '2026-05-04T10:00', description: 'Test event description'
      });

      expect(component.submitError).toContain('Error al enviar el reporte');
      expect(component.isSubmitting).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should display field-level error messages', () => {
      const control = component.eventForm.get('patientFirstName');
      control?.markAsTouched();

      const error = component.getFieldError('patientFirstName');

      expect(error).toBeTruthy();
      expect(error).toContain('obligatorio');
    });

    it('should mark all fields as touched when submitting invalid form', () => {
      component.onSubmit();

      const allTouched = Object.keys(component.eventForm.controls).every(
        key => component.eventForm.get(key)?.touched
      );

      expect(allTouched).toBeTruthy();
    });
  });

  describe('Navigation', () => {
    it('should navigate to dashboard on cancel', () => {
      component.goToDashboard();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });
});
