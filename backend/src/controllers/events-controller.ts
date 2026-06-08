import { Request, Response } from 'express';
import { AuthService } from '../services/auth-service';
import { EventService } from '../services/event-service';
import { createErrorResponse, createSuccessResponse, ValidationError } from '../shared/validation';

export class EventsController {
  constructor(
    private eventService: EventService,
    private authService: AuthService
  ) {}

  async createEvent(req: Request, res: Response) {
    try {
      const user = await this.authenticate(req, res);
      if (!user) return;

      const event = await this.eventService.createEvent(req.body, user.id);
      res.status(201).json(createSuccessResponse({ event }, 'Event reported successfully'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      }

      console.error('Error creating event:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  async getEvents(req: Request, res: Response) {
    try {
      const user = await this.authenticate(req, res);
      if (!user) return;

      const page = parseInt(req.query.page as string, 10) || 1;
      const pageSize = parseInt(req.query.pageSize as string, 10) || 20;
      const limit = parseInt(req.query.limit as string, 10);

      if (limit) {
        const events = await this.eventService.getEvents(limit);
        return res.json(createSuccessResponse({ events }, 'Events loaded successfully'));
      }

      const filters = {
        month: req.query.month ? parseInt(req.query.month as string, 10) : undefined,
        year: req.query.year ? parseInt(req.query.year as string, 10) : undefined,
        patientName: req.query.patientName as string | undefined,
        clinicalHistoryNumber: req.query.clinicalHistoryNumber as string | undefined,
        service: req.query.service as string | undefined
      };

      const result = await this.eventService.getFilteredEvents(filters, page, pageSize);
      res.json(createSuccessResponse({
        events: result.events,
        pagination: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages
        }
      }, 'Events loaded successfully'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      }

      console.error('Error fetching events:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const user = await this.authenticate(req, res);
      if (!user) return;

      const filters = {
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      };

      const stats = await this.eventService.getStatistics(filters);
      res.json(createSuccessResponse(stats, 'Statistics loaded successfully'));
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(error.statusCode).json(createErrorResponse(error.message, error.statusCode));
      }

      console.error('Error fetching statistics:', error);
      res.status(500).json(createErrorResponse('Internal server error'));
    }
  }

  private async authenticate(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json(createErrorResponse('Authorization token required', 401));
      return null;
    }

    const token = authHeader.substring(7);
    const user = await this.authService.verifyToken(token);
    if (!user) {
      res.status(401).json(createErrorResponse('Invalid or expired token', 401));
      return null;
    }

    return user;
  }
}
