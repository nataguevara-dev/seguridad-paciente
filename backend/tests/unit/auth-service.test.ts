import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../../src/services/auth-service';
import { UserRepository } from '../../src/repositories/user-repository';
import type { User } from '../../src/models';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: Partial<UserRepository>;

  beforeEach(() => {
    userRepository = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn()
    };

    authService = new AuthService(userRepository as UserRepository);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'reporter',
        createdAt: '2026-05-04T10:00:00Z'
      };

      (userRepository.findByEmail as any).mockResolvedValue(null);
      (userRepository.create as any).mockResolvedValue(mockUser);

      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        role: 'reporter'
      });

      expect(result.success).toBeTruthy();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should reject duplicate email registration', async () => {
      const existingUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'reporter',
        createdAt: '2026-05-04T10:00:00Z'
      };

      (userRepository.findByEmail as any).mockResolvedValue(existingUser);

      try {
        await authService.register({
          email: 'test@example.com',
          password: 'password123',
          role: 'reporter'
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('already exists');
      }
    });

    it('should validate email format', async () => {
      try {
        await authService.register({
          email: 'invalid-email',
          password: 'password123',
          role: 'reporter'
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Validation failed');
      }
    });

    it('should validate password length', async () => {
      try {
        await authService.register({
          email: 'test@example.com',
          password: '123',
          role: 'reporter'
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Validation failed');
      }
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      // Create a user with the correct password hash
      const hashedPassword = await new (await import('crypto')).createHash('sha256').update('password123' + 'patient-safety-secret').digest('hex');
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        role: 'reporter',
        createdAt: '2026-05-04T10:00:00Z'
      };

      (userRepository.findByEmail as any).mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result.success).toBeTruthy();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      (userRepository.findByEmail as any).mockResolvedValue(null);

      try {
        await authService.login({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid credentials');
      }
    });

    it('should reject wrong password', async () => {
      const hashedPassword = await new (await import('crypto')).createHash('sha256').update('correct' + 'patient-safety-secret').digest('hex');
      (userRepository.findByEmail as any).mockResolvedValue({
        id: 'user-1', email: 'test@example.com', passwordHash: hashedPassword, role: 'reporter', createdAt: '2026-01-01T00:00:00Z'
      });

      try {
        await authService.login({ email: 'test@example.com', password: 'wrong' });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Invalid credentials');
      }
    });

    it('should validate login input', async () => {
      try {
        await authService.login({ email: '', password: '' });
        expect.fail('Should have thrown validation error');
      } catch (error: any) {
        expect(error.message).toContain('Validation failed');
      }
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      const mockUser: User = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: 'reporter',
        createdAt: '2026-05-04T10:00:00Z'
      };

      (userRepository.findById as any).mockResolvedValue(mockUser);

      // Create a valid token for user-1
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        userId: 'user-1',
        email: 'test@example.com',
        role: 'reporter',
        exp: Date.now() + (24 * 60 * 60 * 1000)
      })).toString('base64');
      const signature = Buffer.from('patient-safety-secret').toString('base64');
      const token = `${header}.${payload}.${signature}`;

      const result = await authService.verifyToken(token);

      expect(result).toBeDefined();
      expect(result?.id).toBe('user-1');
    });

    it('should reject invalid token', async () => {
      const result = await authService.verifyToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should reject expired token', async () => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
      const payload = Buffer.from(JSON.stringify({
        userId: 'user-1',
        exp: Date.now() - 1000
      })).toString('base64');
      const token = `${header}.${payload}.signature`;

      const result = await authService.verifyToken(token);

      expect(result).toBeNull();
    });

    it('should handle malformed token gracefully', async () => {
      const result = await authService.verifyToken('not.valid.json');
      expect(result).toBeNull();
    });
  });
});