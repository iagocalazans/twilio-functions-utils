const { of } = require('rxjs');
const { 
  validateFlexToken,
  validateFlexTokenWithOptions,
  requireFlexAuth
} = require('../dist');

// Add missing fail function for Jest
const fail = (message) => {
  throw new Error(message || 'Test failed');
};

// Mock the twilio-flex-token-validator module
jest.mock('twilio-flex-token-validator', () => ({
  validator: jest.fn()
}));

const { validator } = require('twilio-flex-token-validator');

describe('Flex Token Validation Operators', () => {
  const mockContext = {
    event: {
      Token: 'valid-token-123',
      WorkerSid: 'WK123'
    },
    env: {
      ACCOUNT_SID: 'AC123',
      AUTH_TOKEN: 'auth-token-secret'
    },
    context: {
      DOMAIN_NAME: 'test.twilio.com',
      PATH: '/test'
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFlexToken', () => {
    it('should pass validation with valid token', (done) => {
      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        expect(token).toBe('valid-token-123');
        expect(accountSid).toBe('AC123');
        expect(authToken).toBe('auth-token-secret');
        callback(null, { valid: true });
      });

      of(mockContext).pipe(
        validateFlexToken()
      ).subscribe({
        next: (ctx) => {
          expect(ctx).toEqual(mockContext);
          done();
        },
        error: () => fail('Should not error with valid token')
      });
    });

    it('should error with invalid token', (done) => {
      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        callback(null, { valid: false });
      });

      of(mockContext).pipe(
        validateFlexToken()
      ).subscribe({
        next: () => fail('Should not emit with invalid token'),
        error: (error) => {
          expect(error.statusCode).toBe(401);
          expect(error.body).toContain('Invalid Flex token');
          done();
        }
      });
    });

    it('should error when Token is missing', (done) => {
      const contextNoToken = {
        ...mockContext,
        event: { WorkerSid: 'WK123' }
      };

      of(contextNoToken).pipe(
        validateFlexToken()
      ).subscribe({
        next: () => fail('Should not emit without token'),
        error: (error) => {
          expect(error.statusCode).toBe(400);
          expect(error.body).toContain('Missing required fields: Token');
          done();
        }
      });
    });

    it('should error when ACCOUNT_SID is missing', (done) => {
      const contextNoAccountSid = {
        ...mockContext,
        env: { AUTH_TOKEN: 'auth-token' }
      };

      of(contextNoAccountSid).pipe(
        validateFlexToken()
      ).subscribe({
        next: () => fail('Should not emit without ACCOUNT_SID'),
        error: (error) => {
          expect(error.statusCode).toBe(500);
          expect(error.body).toContain('Missing required environment variables: ACCOUNT_SID');
          done();
        }
      });
    });

    it('should error when AUTH_TOKEN is missing', (done) => {
      const contextNoAuthToken = {
        ...mockContext,
        env: { ACCOUNT_SID: 'AC123' }
      };

      of(contextNoAuthToken).pipe(
        validateFlexToken()
      ).subscribe({
        next: () => fail('Should not emit without AUTH_TOKEN'),
        error: (error) => {
          expect(error.statusCode).toBe(500);
          expect(error.body).toContain('Missing required environment variables: AUTH_TOKEN');
          done();
        }
      });
    });

    it('should handle validator errors', (done) => {
      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        callback(new Error('Validator error'));
      });

      of(mockContext).pipe(
        validateFlexToken()
      ).subscribe({
        next: () => fail('Should not emit on validator error'),
        error: (error) => {
          expect(error.statusCode).toBe(500);
          expect(error.body).toContain('Validator error');
          done();
        }
      });
    });
  });

  describe('validateFlexTokenWithOptions', () => {
    it('should pass custom options to validator', (done) => {
      const customOptions = {
        allowLocal: true,
        tokenExpiry: 3600
      };

      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        expect(options).toEqual(customOptions);
        callback(null, { valid: true });
      });

      of(mockContext).pipe(
        validateFlexTokenWithOptions(customOptions)
      ).subscribe({
        next: (ctx) => {
          expect(ctx).toEqual(mockContext);
          done();
        }
      });
    });

    it('should work with empty options', (done) => {
      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        expect(options).toEqual({});
        callback(null, { valid: true });
      });

      of(mockContext).pipe(
        validateFlexTokenWithOptions({})
      ).subscribe({
        next: () => done()
      });
    });
  });

  describe('requireFlexAuth', () => {
    it('should be an alias for validateFlexToken', (done) => {
      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        callback(null, { valid: true });
      });

      of(mockContext).pipe(
        requireFlexAuth()
      ).subscribe({
        next: (ctx) => {
          expect(ctx).toEqual(mockContext);
          expect(validator).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('Integration scenarios', () => {
    it('should work in a complete pipeline', (done) => {
      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        callback(null, { valid: true });
      });

      const { ok } = require('../dist');

      of(mockContext).pipe(
        validateFlexToken(),
        ok()
      ).subscribe({
        next: (response) => {
          expect(response.statusCode).toBe(200);
          done();
        }
      });
    });

    it('should handle validation with additional context data', (done) => {
      const contextWithExtra = {
        ...mockContext,
        event: {
          ...mockContext.event,
          TaskSid: 'WT123',
          WorkspaceSid: 'WS123'
        }
      };

      validator.mockImplementation((token, accountSid, authToken, options, callback) => {
        callback(null, { 
          valid: true,
          worker_sid: 'WK123',
          roles: ['agent', 'supervisor']
        });
      });

      of(contextWithExtra).pipe(
        validateFlexToken()
      ).subscribe({
        next: (ctx) => {
          expect(ctx.event.TaskSid).toBe('WT123');
          expect(ctx.event.WorkspaceSid).toBe('WS123');
          done();
        },
        error: (error) => {
          done(error);
        }
      });
    }, 10000);
  });
});