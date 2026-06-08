import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthService } from './auth.service';
import { API_AUTH_URL } from '../config';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    service = new AuthService();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('register', () => {
    it('should make POST request and store token on success', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          message: 'Registered',
          data: { id: '1', email: 'test@test.com', role: 'reporter', token: 'abc123' }
        })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.register('test@test.com', 'password123', 'reporter');

      expect(result.success).toBe(true);
      expect(localStorage.getItem('auth_token')).toBe('abc123');
      expect(localStorage.getItem('user')).toContain('test@test.com');
      expect(fetch).toHaveBeenCalledWith(`${API_AUTH_URL}/register`, expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com', password: 'password123', role: 'reporter' })
      }));
    });

    it('should not store token on failed response', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ success: false, message: 'Email exists' })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.register('test@test.com', 'password123', 'reporter');

      expect(result.success).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should return error on network failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await service.register('test@test.com', 'password123', 'reporter');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error');
    });

    it('should return generic message on non-Error rejection', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue('string error');

      const result = await service.register('test@test.com', 'password123', 'reporter');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Registration failed');
    });
  });

  describe('login', () => {
    it('should make POST request and store token on success', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          message: 'Logged in',
          data: { user: { id: '1', email: 'test@test.com', role: 'reporter' }, token: 'xyz789' }
        })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.login('test@test.com', 'password123');

      expect(result.success).toBe(true);
      expect(localStorage.getItem('auth_token')).toBe('xyz789');
      expect(localStorage.getItem('user')).toContain('test@test.com');
      expect(fetch).toHaveBeenCalledWith(`${API_AUTH_URL}/login`, expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@test.com', password: 'password123' })
      }));
    });

    it('should not store token on failed login', async () => {
      const mockResponse = {
        ok: false,
        json: vi.fn().mockResolvedValue({ success: false, message: 'Invalid credentials' })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.login('bad@test.com', 'wrong');

      expect(result.success).toBe(false);
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('should return error on network failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await service.login('test@test.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error');
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no token', async () => {
      const result = await service.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should fetch user with token', async () => {
      localStorage.setItem('auth_token', 'valid-token');
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: { id: '1', email: 'test@test.com', role: 'reporter' } })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.getCurrentUser();

      expect(result).toEqual({ id: '1', email: 'test@test.com', role: 'reporter' });
      expect(fetch).toHaveBeenCalledWith(`${API_AUTH_URL}/me`, expect.objectContaining({
        headers: { 'Authorization': 'Bearer valid-token' }
      }));
    });

    it('should return null when data.data is empty', async () => {
      localStorage.setItem('auth_token', 'valid-token');
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: null })
      };
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse as any);

      const result = await service.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return null when response not ok', async () => {
      localStorage.setItem('auth_token', 'valid-token');
      vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as any);

      const result = await service.getCurrentUser();
      expect(result).toBeNull();
    });

    it('should return null on fetch error', async () => {
      localStorage.setItem('auth_token', 'valid-token');
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await service.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('login error handling', () => {
    it('should handle non-Error rejection', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue('string rejection');

      const result = await service.login('test@test.com', 'password');
      expect(result.message).toBe('Login failed');
    });

    it('should handle Error rejection', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

      const result = await service.login('test@test.com', 'password');
      expect(result.message).toBe('Network error');
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', 'my-token');
      expect(service.getToken()).toBe('my-token');
    });

    it('should return null when no token', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('getStoredUser', () => {
    it('should return parsed user from localStorage', () => {
      const user = { id: '1', email: 'test@test.com', role: 'reporter' };
      localStorage.setItem('user', JSON.stringify(user));
      expect(service.getStoredUser()).toEqual(user);
    });

    it('should return null when no user stored', () => {
      expect(service.getStoredUser()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      localStorage.setItem('auth_token', 'some-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false when no token', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should remove auth_token and user from localStorage', () => {
      localStorage.setItem('auth_token', 'some-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', email: 'test@test.com', role: 'reporter' }));

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
