const { 
  BadRequestError, 
  InternalServerError, 
  NotFoundError, 
  UnauthorizedError 
} = require('../dist');

describe('Error Classes', () => {
  describe('BadRequestError', () => {
    it('should create error with 400 status code', () => {
      const error = new BadRequestError('Invalid input');
      
      expect(error.statusCode).toBe(400);
      expect(error.body).toBe('[ BadRequestError ]: Invalid input');
      expect(error.headers['Content-Type']).toBe('text/plain');
    });

    it('should handle object messages', () => {
      const error = new BadRequestError({ field: 'email', message: 'Invalid format' });
      
      expect(error.statusCode).toBe(400);
      expect(error.body).toBe('[ BadRequestError ]: {"field":"email","message":"Invalid format"}');
    });

    it('should set CORS headers', () => {
      const error = new BadRequestError('Test');
      
      expect(error.headers['Access-Control-Allow-Origin']).toBe('*');
      expect(error.headers['Access-Control-Allow-Methods']).toBe('OPTIONS, POST');
      expect(error.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
    });
  });

  describe('InternalServerError', () => {
    it('should create error with 500 status code', () => {
      const error = new InternalServerError('Server error');
      
      expect(error.statusCode).toBe(500);
      expect(error.body).toBe('[ InternalServerError ]: Server error');
    });

    it('should handle Error objects', () => {
      const originalError = new Error('Database connection failed');
      const error = new InternalServerError(originalError.message);
      
      expect(error.statusCode).toBe(500);
      expect(error.body).toBe('[ InternalServerError ]: Database connection failed');
    });

    it('should handle missing message', () => {
      const error = new InternalServerError();
      
      expect(error.statusCode).toBe(500);
      expect(error.body).toBe('[ InternalServerError ]: undefined');
    });
  });

  describe('NotFoundError', () => {
    it('should create error with 404 status code', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.body).toBe('[ NotFoundError ]: Resource not found');
    });

    it('should handle specific resource messages', () => {
      const error = new NotFoundError('User with ID 123 not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.body).toBe('[ NotFoundError ]: User with ID 123 not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create error with 401 status code', () => {
      const error = new UnauthorizedError('Invalid credentials');
      
      expect(error.statusCode).toBe(401);
      expect(error.body).toBe('[ UnauthorizedError ]: Invalid credentials');
    });

    it('should handle token errors', () => {
      const error = new UnauthorizedError('Token expired');
      
      expect(error.statusCode).toBe(401);
      expect(error.body).toBe('[ UnauthorizedError ]: Token expired');
    });

    it('should handle missing auth', () => {
      const error = new UnauthorizedError('Authentication required');
      
      expect(error.statusCode).toBe(401);
      expect(error.body).toBe('[ UnauthorizedError ]: Authentication required');
    });
  });

  describe('Error inheritance', () => {
    it('should all extend Response class', () => {
      const { Response } = require('../dist');
      
      const badRequest = new BadRequestError('test');
      const serverError = new InternalServerError('test');
      const notFound = new NotFoundError('test');
      const unauthorized = new UnauthorizedError('test');
      
      expect(badRequest).toBeInstanceOf(Response);
      expect(serverError).toBeInstanceOf(Response);
      expect(notFound).toBeInstanceOf(Response);
      expect(unauthorized).toBeInstanceOf(Response);
    });

    it('should be usable in catch blocks', () => {
      try {
        throw new BadRequestError('Validation failed');
      } catch (error) {
        expect(error.statusCode).toBe(400);
        expect(error.body).toContain('Validation failed');
      }
    });
  });

  describe('Error formatting', () => {
    it('should format arrays properly', () => {
      const errors = ['Field 1 is required', 'Field 2 is invalid'];
      const error = new BadRequestError(errors);
      
      expect(error.body).toBe('[ BadRequestError ]: ["Field 1 is required","Field 2 is invalid"]');
    });

    it('should handle null and undefined', () => {
      const nullError = new BadRequestError(null);
      const undefinedError = new BadRequestError(undefined);
      
      expect(nullError.body).toBe('[ BadRequestError ]: null');
      expect(undefinedError.body).toBe('[ BadRequestError ]: undefined');
    });

    it('should handle complex objects', () => {
      const error = new BadRequestError({
        errors: [
          { field: 'email', code: 'INVALID_FORMAT' },
          { field: 'phone', code: 'REQUIRED' }
        ],
        timestamp: '2023-01-01T00:00:00Z'
      });
      
      expect(error.body).toContain('INVALID_FORMAT');
      expect(error.body).toContain('REQUIRED');
      expect(error.body).toContain('timestamp');
    });
  });
});