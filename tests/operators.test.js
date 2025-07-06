const { of, throwError } = require('rxjs');

// Add missing fail function for Jest
const fail = (message) => {
  throw new Error(message || 'Test failed');
};
const { 
  injectEvent,
  injectEnv,
  injectClient,
  injectProviders,
  injectProvider,
  inject,
  injectMany,
  requireFields,
  validateEvent,
  requireEnvVars,
  authenticated,
  transformEvent,
  ok,
  created,
  accepted,
  noContent,
  toJsonResponse,
  toTwiMLResponse,
  redirect,
  apiResponse,
  withHeaders,
  withHeader,
  handleError,
  retryWithBackoff,
  timeoutWithError,
  validate,
  fallback,
  ensureResponse,
  handleResult,
  toResultOk,
  toResultFailed,
  toResult,
  mapResult,
  switchMapResult,
  Result,
  Response,
  TwiMLResponse
} = require('../dist');

describe('Injection Operators', () => {
  const mockContext = {
    event: { To: '+1234567890', Body: 'Test' },
    env: { API_KEY: 'test-key', API_SECRET: 'test-secret' },
    client: { messages: { create: jest.fn() } },
    providers: { userService: { getUser: jest.fn() } },
    request: {
      headers: { 'authorization': 'Bearer token' },
      cookies: { session: 'abc123' }
    }
  };

  it('should inject event data', (done) => {
    of(mockContext).pipe(
      injectEvent()
    ).subscribe(event => {
      expect(event).toEqual(mockContext.event);
      done();
    });
  });

  it('should inject environment variables', (done) => {
    of(mockContext).pipe(
      injectEnv()
    ).subscribe(env => {
      expect(env).toEqual(mockContext.env);
      done();
    });
  });

  it('should inject Twilio client', (done) => {
    of(mockContext).pipe(
      injectClient()
    ).subscribe(client => {
      expect(client).toEqual(mockContext.client);
      done();
    });
  });

  it('should inject providers', (done) => {
    of(mockContext).pipe(
      injectProviders()
    ).subscribe(providers => {
      expect(providers).toEqual(mockContext.providers);
      done();
    });
  });

  it('should inject specific provider', (done) => {
    of(mockContext).pipe(
      injectProvider('userService')
    ).subscribe(userService => {
      expect(userService).toEqual(mockContext.providers.userService);
      done();
    });
  });

  it('should inject with custom selector', (done) => {
    of(mockContext).pipe(
      inject(ctx => ({ event: ctx.event, env: ctx.env }))
    ).subscribe(result => {
      expect(result).toEqual({
        event: mockContext.event,
        env: mockContext.env
      });
      done();
    });
  });

  it('should inject many values', (done) => {
    of(mockContext).pipe(
      injectMany({
        to: ctx => ctx.event.To,
        apiKey: ctx => ctx.env.API_KEY,
        client: ctx => ctx.client
      })
    ).subscribe(result => {
      expect(result).toEqual({
        to: '+1234567890',
        apiKey: 'test-key',
        client: mockContext.client
      });
      done();
    });
  });
});

describe('Validation Operators', () => {
  const mockContext = {
    event: { To: '+1234567890', Body: 'Test' },
    env: { API_KEY: 'test-key' }
  };

  it('should pass when required fields exist', (done) => {
    of(mockContext).pipe(
      requireFields('To', 'Body')
    ).subscribe({
      next: (ctx) => {
        expect(ctx).toEqual(mockContext);
        done();
      },
      error: () => fail('Should not error')
    });
  });

  it('should error when required fields missing', (done) => {
    const incompleteContext = { ...mockContext, event: { To: '+1234567890' } };
    
    of(incompleteContext).pipe(
      requireFields('To', 'Body')
    ).subscribe({
      next: () => fail('Should not emit'),
      error: (error) => {
        expect(error.statusCode).toBe(400);
        expect(error.body).toContain('Missing required fields: Body');
        done();
      }
    });
  });

  it('should validate event with custom validator', (done) => {
    of(mockContext).pipe(
      validateEvent(event => {
        if (!event.To.startsWith('+')) {
          throw new Error('Phone number must start with +');
        }
        return true;
      })
    ).subscribe({
      next: (ctx) => {
        expect(ctx).toEqual(mockContext);
        done();
      }
    });
  });

  it('should error on validation failure', (done) => {
    of(mockContext).pipe(
      validateEvent(event => {
        throw new Error('Validation failed');
      })
    ).subscribe({
      next: () => fail('Should not emit'),
      error: (error) => {
        expect(error.statusCode).toBe(400);
        expect(error.body).toContain('Validation failed');
        done();
      }
    });
  });

  it('should require environment variables', (done) => {
    of(mockContext).pipe(
      requireEnvVars('API_KEY')
    ).subscribe({
      next: (ctx) => {
        expect(ctx).toEqual(mockContext);
        done();
      }
    });
  });

  it('should error on missing env vars', (done) => {
    const contextNoEnv = { ...mockContext, env: {} };
    
    of(contextNoEnv).pipe(
      requireEnvVars('API_KEY', 'API_SECRET')
    ).subscribe({
      next: () => fail('Should not emit'),
      error: (error) => {
        expect(error.statusCode).toBe(500);
        expect(error.body).toContain('Missing required environment variables');
        done();
      }
    });
  });

  it('should handle authentication', (done) => {
    const authCheck = (ctx) => ctx.request.headers.authorization === 'Bearer token';
    
    of(mockContext).pipe(
      authenticated(authCheck)
    ).subscribe({
      next: (ctx) => {
        expect(ctx).toEqual(mockContext);
        done();
      }
    });
  });

  it('should reject unauthorized requests', (done) => {
    const authCheck = () => false;
    
    of(mockContext).pipe(
      authenticated(authCheck)
    ).subscribe({
      next: () => fail('Should not emit'),
      error: (error) => {
        expect(error.statusCode).toBe(401);
        done();
      }
    });
  });

  it('should transform event data', (done) => {
    of(mockContext).pipe(
      transformEvent(event => ({
        ...event,
        Normalized: event.To.replace(/\D/g, '')
      }))
    ).subscribe(ctx => {
      expect(ctx.event.Normalized).toBe('1234567890');
      done();
    });
  });
});

describe('Response Operators', () => {
  it('should create 200 OK response', (done) => {
    of({ message: 'Success' }).pipe(ok()).subscribe(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ message: 'Success' });
      done();
    });
  });

  it('should create 201 Created response', (done) => {
    of({ id: 123 }).pipe(created()).subscribe(response => {
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual({ id: 123 });
      done();
    });
  });

  it('should create 202 Accepted response', (done) => {
    of({ processing: true }).pipe(accepted()).subscribe(response => {
      expect(response.statusCode).toBe(202);
      done();
    });
  });

  it('should create 204 No Content response', (done) => {
    of(null).pipe(noContent()).subscribe(response => {
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('');
      done();
    });
  });

  it('should create custom JSON response', (done) => {
    of({ data: 'test' }).pipe(
      toJsonResponse(200, { 'X-Custom': 'header' })
    ).subscribe(response => {
      expect(response.statusCode).toBe(200);
      expect(response.headers['X-Custom']).toBe('header');
      done();
    });
  });

  it('should create TwiML response', (done) => {
    of(null).pipe(
      toTwiMLResponse(twiml => {
        twiml.say('Hello World');
      })
    ).subscribe(response => {
      expect(response).toBeInstanceOf(TwiMLResponse);
      expect(response.body).toContain('<Say>Hello World</Say>');
      done();
    });
  });

  it('should create redirect response', (done) => {
    of(null).pipe(
      redirect('https://example.com')
    ).subscribe(response => {
      expect(response.statusCode).toBe(302);
      expect(response.headers.Location).toBe('https://example.com');
      done();
    });
  });

  it('should create redirect with custom status', (done) => {
    of(null).pipe(
      redirect('https://example.com', 301)
    ).subscribe(response => {
      expect(response.statusCode).toBe(301);
      done();
    });
  });

  it('should create API response format', (done) => {
    of({ id: 1, name: 'Test' }).pipe(
      apiResponse()
    ).subscribe(response => {
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ id: 1, name: 'Test' });
      done();
    });
  });

  it('should add headers to response', (done) => {
    of(new Response({})).pipe(
      withHeaders({ 'X-Custom': 'value', 'X-Another': 'test' })
    ).subscribe(response => {
      expect(response.headers['X-Custom']).toBe('value');
      expect(response.headers['X-Another']).toBe('test');
      done();
    });
  });

  it('should add single header', (done) => {
    of(new Response({})).pipe(
      withHeader('X-Test', 'value')
    ).subscribe(response => {
      expect(response.headers['X-Test']).toBe('value');
      done();
    });
  });
});

describe('Error Handling Operators', () => {
  it('should handle errors with custom mapper', (done) => {
    throwError(new Error('Test error')).pipe(
      handleError(error => ({
        statusCode: 503,
        body: `Service unavailable: ${error.message}`
      }))
    ).subscribe(response => {
      expect(response.statusCode).toBe(503);
      expect(response.body).toContain('Service unavailable: Test error');
      done();
    });
  });

  it('should retry with backoff', (done) => {
    let attempts = 0;
    const source = of(null).pipe(
      switchMapResult(() => {
        attempts++;
        if (attempts < 3) {
          return throwError(new Error('Retry me'));
        }
        return of({ success: true });
      })
    );

    source.pipe(
      retryWithBackoff(3, 10, 2)
    ).subscribe({
      next: (result) => {
        expect(attempts).toBe(3);
        expect(result).toEqual({ success: true });
        done();
      }
    });
  });

  it('should timeout with error', (done) => {
    const slowObservable = new Observable(subscriber => {
      setTimeout(() => subscriber.next('too late'), 200);
    });

    slowObservable.pipe(
      timeoutWithError(50, 'Operation timed out')
    ).subscribe({
      next: () => fail('Should not emit'),
      error: (error) => {
        expect(error.statusCode).toBe(504);
        expect(error.body).toContain('Operation timed out');
        done();
      }
    });
  });

  it('should validate stream data', (done) => {
    of({ value: 42 }).pipe(
      validate(
        data => data.value > 40,
        () => new Error('Value too small')
      )
    ).subscribe({
      next: (data) => {
        expect(data.value).toBe(42);
        done();
      }
    });
  });

  it('should fallback on error', (done) => {
    throwError(new Error('Failed')).pipe(
      fallback({ default: 'value' })
    ).subscribe(result => {
      expect(result).toEqual({ default: 'value' });
      done();
    });
  });

  it('should ensure response object', (done) => {
    of({ plain: 'object' }).pipe(
      ensureResponse()
    ).subscribe(response => {
      expect(response).toBeInstanceOf(Response);
      expect(response.body).toEqual({ plain: 'object' });
      done();
    });
  });

  it('should not modify existing response', (done) => {
    const response = new Response({ test: true }, 201);
    
    of(response).pipe(
      ensureResponse()
    ).subscribe(result => {
      expect(result).toBe(response);
      expect(result.statusCode).toBe(201);
      done();
    });
  });
});

describe('Result Pattern Operators', () => {
  it('should handle Result.ok', (done) => {
    of(Result.ok({ value: 42 })).pipe(
      handleResult()
    ).subscribe(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ value: 42 });
      done();
    });
  });

  it('should handle Result.failed', (done) => {
    of(Result.failed('Error message')).pipe(
      handleResult()
    ).subscribe(response => {
      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('Error message');
      done();
    });
  });

  it('should convert to Result.ok', (done) => {
    of({ data: 'test' }).pipe(
      toResultOk()
    ).subscribe(result => {
      expect(result.isError).toBe(false);
      expect(result.data).toEqual({ data: 'test' });
      done();
    });
  });

  it('should convert to Result.failed', (done) => {
    of('error message').pipe(
      toResultFailed()
    ).subscribe(result => {
      expect(result.isError).toBe(true);
      expect(result.error).toBe('error message');
      done();
    });
  });

  it('should convert to Result handling errors', (done) => {
    throwError(new Error('Failed')).pipe(
      toResult()
    ).subscribe(result => {
      expect(result.isError).toBe(true);
      expect(result.error.message).toBe('Failed');
      done();
    });
  });

  it('should map Result values', (done) => {
    of(Result.ok(5)).pipe(
      mapResult(x => x * 2)
    ).subscribe(result => {
      expect(result.isError).toBe(false);
      expect(result.data).toBe(10);
      done();
    });
  });

  it('should switchMap Result values', (done) => {
    of(Result.ok(5)).pipe(
      switchMapResult(x => of(x * 3))
    ).subscribe(result => {
      expect(result.isError).toBe(false);
      expect(result.data).toBe(15);
      done();
    });
  });
});