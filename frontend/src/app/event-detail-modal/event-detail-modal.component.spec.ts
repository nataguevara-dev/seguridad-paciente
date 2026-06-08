import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventDetailModalComponent } from './event-detail-modal.component';

describe('EventDetailModalComponent', () => {
  let component: EventDetailModalComponent;

  beforeEach(() => {
    component = new EventDetailModalComponent();
  });

  describe('statusLabel', () => {
    it('should return "Enviado" for sent status', () => {
      expect(component.statusLabel('sent')).toBe('Enviado');
    });

    it('should return "Error" for failed status', () => {
      expect(component.statusLabel('failed')).toBe('Error');
    });

    it('should return "Pendiente" for unknown status', () => {
      expect(component.statusLabel('pending')).toBe('Pendiente');
      expect(component.statusLabel('whatever')).toBe('Pendiente');
    });
  });

  describe('formatDate', () => {
    it('should format date string in Spanish locale', () => {
      const result = component.formatDate('2026-05-04T10:30:00');
      expect(result).toContain('mayo');
      expect(result).toContain('2026');
    });

    it('should handle different date formats', () => {
      const result = component.formatDate('2026-01-15T08:00:00');
      expect(result).toContain('enero');
    });
  });

  describe('Escape key handler', () => {
    it('should emit close event on escape key', () => {
      const emitSpy = vi.fn();
      component.close = { emit: emitSpy } as any;

      component.onEscape();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('Input event binding', () => {
    it('should accept event input', () => {
      const mockEvent = { id: '1', patientFirstName: 'Test', patientLastName: 'User' } as any;
      component.event = mockEvent;
      expect(component.event).toBe(mockEvent);
    });
  });
});
