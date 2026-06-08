import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Router } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../services/auth.service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let mockRouter: Partial<Router>;
  let mockAuthService: Partial<AuthService>;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn()
    };
    mockAuthService = {
      getStoredUser: vi.fn().mockReturnValue({ id: '1', email: 'test@example.com', role: 'reporter' }),
      logout: vi.fn()
    };
    const mockEventsService = { getEvents: vi.fn().mockResolvedValue([]) };
    const mockCdr = { detectChanges: vi.fn() };

    component = new DashboardComponent(mockRouter as Router, mockAuthService as AuthService, mockEventsService as any, mockCdr as any);
  });

  describe('Initialization', () => {
    it('should load current user on init', () => {
      component.ngOnInit();
      expect(component.currentUser).toBeDefined();
      expect(component.currentUser?.email).toBe('test@example.com');
    });
  });

  describe('loadRecentEvents', () => {
    it('should set error on failure', async () => {
      const mockEventsService = { getEvents: vi.fn().mockRejectedValue(new Error('fail')) };
      const mockCdr = { detectChanges: vi.fn() };
      component = new DashboardComponent(mockRouter as Router, mockAuthService as AuthService, mockEventsService as any, mockCdr as any);

      await component['loadRecentEvents']();

      expect(component.loadError).toBe('No se pudieron cargar los eventos recientes. Intenta de nuevo más tarde.');
      expect(component.isLoading).toBe(false);
    });

    it('should load events successfully', async () => {
      const mockEvents = [{ id: '1', service: 'Urgencias', createdAt: new Date().toISOString(), description: 'Test' }];
      const mockEventsService = { getEvents: vi.fn().mockResolvedValue(mockEvents) };
      const mockCdr = { detectChanges: vi.fn() };
      component = new DashboardComponent(mockRouter as Router, mockAuthService as AuthService, mockEventsService as any, mockCdr as any);

      await component['loadRecentEvents']();

      expect(component.events).toEqual(mockEvents);
      expect(component.isLoading).toBe(false);
      expect(component.loadError).toBeNull();
    });
  });

  describe('relativeTime', () => {
    it('should return less than a minute for recent dates', () => {
      const recent = new Date().toISOString();
      expect(component.relativeTime(recent)).toBe('Hace menos de 1 minuto');
    });

    it('should return minutes', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const result = component.relativeTime(date);
      expect(result).toContain('5 minutos');
    });

    it('should return singular minute', () => {
      const date = new Date(Date.now() - 1 * 60 * 1000).toISOString();
      const result = component.relativeTime(date);
      expect(result).toBe('Hace 1 minuto');
    });

    it('should return hours', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
      const result = component.relativeTime(date);
      expect(result).toContain('3 horas');
    });

    it('should return singular hour', () => {
      const date = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      const result = component.relativeTime(date);
      expect(result).toBe('Hace 1 hora');
    });

    it('should return days', () => {
      const date = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const result = component.relativeTime(date);
      expect(result).toContain('10 días');
    });

    it('should return singular day', () => {
      const date = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();
      const result = component.relativeTime(date);
      expect(result).toBe('Hace 1 día');
    });

    it('should return formatted date for older events', () => {
      const date = '2025-01-15T10:00:00';
      const result = component.relativeTime(date);
      expect(typeof result).toBe('string');
      expect(result).toBe(new Date(date).toLocaleDateString('es-ES'));
    });
  });

  describe('truncate', () => {
    it('should return text unchanged when within limit', () => {
      expect(component.truncate('Hello World')).toBe('Hello World');
    });

    it('should truncate and add ellipsis when exceeding limit', () => {
      const result = component.truncate('A'.repeat(200), 50);
      expect(result.length).toBe(53);
      expect(result.endsWith('...')).toBe(true);
    });
  });

  describe('Navigation', () => {
    it('should navigate to event report page', () => {
      component.navigateToEventReport();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/event-report']);
    });

    it('should navigate to event history page', () => {
      component.navigateToEventHistory();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/events']);
    });

    it('should navigate to statistics page', () => {
      component.navigateToStatistics();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/estadisticas']);
    });

    it('should logout and navigate to login', () => {
      component.logout();
      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
    });
  });
});
