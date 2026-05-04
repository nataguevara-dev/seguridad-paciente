import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import { AuthService } from '../services/auth-service';
import { UserRepository } from '../repositories/user-repository';
import { UserModel } from '../models/user';
import { db } from '../startup';

const router = Router();

// Initialize dependencies
const userModel = new UserModel(db);
const userRepository = new UserRepository(userModel);
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

// Routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/me', authController.me.bind(authController));

export default router;