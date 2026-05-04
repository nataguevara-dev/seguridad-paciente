import { User } from '../models';
import { UserRepository } from '../repositories/user-repository';
import { validateEmail, validateRequired, validateStringLength, combineValidations, ValidationError } from '../shared/validation';
import { config } from '../config';

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  async register(data: RegisterData): Promise<AuthResult> {
    // Validate input
    const emailValidation = validateEmail(data.email);
    const passwordValidation = validateStringLength(data.password, 'password', 6, 100);
    const roleValidation = validateRequired(data.role, 'role');

    const validation = combineValidations(emailValidation, passwordValidation, roleValidation);
    if (!validation.isValid) {
      throw new ValidationError(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ValidationError('User already exists with this email');
    }

    // Hash password (simple for prototype)
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      role: data.role
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      success: true,
      user,
      token
    };
  }

  async login(data: LoginData): Promise<AuthResult> {
    // Validate input
    const emailValidation = validateEmail(data.email);
    const passwordValidation = validateRequired(data.password, 'password');

    const validation = combineValidations(emailValidation, passwordValidation);
    if (!validation.isValid) {
      throw new ValidationError(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Find user
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new ValidationError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      success: true,
      user,
      token
    };
  }

  async verifyToken(token: string): Promise<User | null> {
    try {
      // Simple token verification for prototype
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      if (payload.exp && payload.exp < Date.now()) return null;

      return await this.userRepository.findById(payload.userId);
    } catch {
      return null;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    // Simple hash for prototype - in production use bcrypt
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(password + config.jwtSecret).digest('hex');
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const hashed = await this.hashPassword(password);
    return hashed === hash;
  }

  private generateToken(user: User): string {
    // Simple JWT-like token for prototype
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
    const payload = Buffer.from(JSON.stringify({
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    })).toString('base64');
    const signature = Buffer.from(config.jwtSecret).toString('base64');
    return `${header}.${payload}.${signature}`;
  }
}