import { Router } from 'express';
import { EventsController } from '../controllers/events-controller';
import { EventService } from '../services/event-service';
import { AuthService } from '../services/auth-service';
import { UserRepository } from '../repositories/user-repository';
import { PatientRepository } from '../repositories/patient-repository';
import { EventRepository } from '../repositories/event-repository';
import { NotificationService } from '../services/notification-service';
import { UserModel } from '../models/user';
import { PatientModel } from '../models/patient';
import { SafetyEventModel } from '../models/safety-event';
import { NotificationConfigModel } from '../models/notification-config';
import { db } from '../startup';

const router = Router();

// Initialize dependencies
const userModel = new UserModel(db);
const patientModel = new PatientModel(db);
const eventModel = new SafetyEventModel(db);
const notificationConfigModel = new NotificationConfigModel(db);

const userRepository = new UserRepository(userModel);
const patientRepository = new PatientRepository(patientModel);
const eventRepository = new EventRepository(eventModel);
const notificationService = new NotificationService(notificationConfigModel);
const authService = new AuthService(userRepository);

const eventService = new EventService(
  eventRepository,
  patientRepository,
  notificationService
);

const eventsController = new EventsController(eventService, authService);

// Routes
router.post('/', eventsController.createEvent.bind(eventsController));
router.get('/', eventsController.getEvents.bind(eventsController));

export default router;