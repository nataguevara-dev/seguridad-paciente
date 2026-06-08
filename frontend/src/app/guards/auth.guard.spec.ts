import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockAuthService: { isAuthenticated: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = { isAuthenticated: vi.fn() };
    mockRouter = { navigate: vi.fn() };
    guard = new AuthGuard(mockAuthService as any, mockRouter as any);
  });

  it('should return true when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    expect(guard.canActivate()).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should navigate to login and return false when not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    expect(guard.canActivate()).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });
});
