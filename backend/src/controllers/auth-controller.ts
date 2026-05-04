import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';
import { createErrorResponse, createSuccessResponse, ValidationError } from '../shared/validation';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;
      const result = await this.authService.register({ email, password, role });

      res.status(201).json(createSuccessResponse({
        id: result.user!.id,
        email: result.user!.email,
        role: result.user!.role,
        token: result.token
      }, 'User registered successfully'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      }
      console.error('Error registering user:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });

      res.json(createSuccessResponse({
        user: {
          id: result.user!.id,
          email: result.user!.email,
          role: result.user!.role
        },
        token: result.token
      }, 'Login successful'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      }
      console.error('Error logging in:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  async me(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(createErrorResponse('Authorization token required', 401));
      }

      const token = authHeader.substring(7);
      const user = await this.authService.verifyToken(token);
      if (!user) {
        return res.status(401).json(createErrorResponse('Invalid or expired token', 401));
      }

      res.json(createSuccessResponse({
        id: user.id,
        email: user.email,
        role: user.role
      }));
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }
}