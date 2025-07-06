const { of, throwError } = require('rxjs');
const { map, switchMap } = require('rxjs/operators');
const { 
  twilioEffect,
  requireFields,
  ok,
  handleError,
  Response
} = require('../dist');

describe('twilioEffect', () => {
  const mockContext = {
    getTwilioClient: jest.fn(() => ({
      messages: { 
        create: jest.fn().mockResolvedValue({ sid: 'SM123' })
      },
      calls: {
        create: jest.fn().mockResolvedValue({ sid: 'CA123' })
      }
    })),
    DOMAIN_NAME: 'test.twilio.com',
    PATH: '/test',
    SERVICE_SID: 'IS123',
    ENVIRONMENT_SID: 'ZE123'
  };
  
  const mockEvent = {
    To: '+1234567890',
    Body: 'Test message',
    From: '+0987654321'
  };
  
  const mockCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle simple effect', async () => {
    const effect = context$ => context$.pipe(
      map(ctx => ({ received: ctx.event.Body })),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: { received: 'Test message' }
    }));
  });

  it('should inject Twilio client', async () => {
    const effect = context$ => context$.pipe(
      switchMap(ctx => {
        expect(ctx.client).toBeDefined();
        expect(ctx.client.messages).toBeDefined();
        return of({ clientAvailable: true });
      }),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockContext.getTwilioClient).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: { clientAvailable: true }
    }));
  });

  it('should handle effects with providers', async () => {
    const providers = {
      userService: ({ env }) => ({
        getUser: (id) => ({ id, env: env.ENVIRONMENT })
      }),
      dataService: () => ({
        getData: () => 'test data'
      })
    };
    
    const effect = context$ => context$.pipe(
      map(ctx => ({
        user: ctx.providers.userService.getUser('123'),
        data: ctx.providers.dataService.getData()
      })),
      ok()
    );
    
    const handler = twilioEffect(effect, { providers });
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: {
        user: { id: '123', env: undefined },
        data: 'test data'
      }
    }));
  });

  it('should handle async provider factories', async () => {
    const providers = {
      asyncService: async ({ client }) => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return {
          getValue: () => 'async value'
        };
      }
    };
    
    const effect = context$ => context$.pipe(
      map(ctx => ({ value: ctx.providers.asyncService.getValue() })),
      ok()
    );
    
    const handler = twilioEffect(effect, { providers });
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: { value: 'async value' }
    }));
  });

  it('should handle Observable provider factories', async () => {
    const providers = {
      observableService: ({ env }) => of({
        getData: () => `Data from ${env.ENVIRONMENT || 'default'}`
      })
    };
    
    const effect = context$ => context$.pipe(
      map(ctx => ({ data: ctx.providers.observableService.getData() })),
      ok()
    );
    
    const handler = twilioEffect(effect, { providers });
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: { data: 'Data from default' }
    }));
  });

  it('should handle validation errors', async () => {
    const effect = context$ => context$.pipe(
      requireFields('To', 'Body', 'MissingField'),
      map(() => ({ shouldNotReach: true })),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 400,
      body: expect.stringContaining('Missing required fields: MissingField')
    }));
  });

  it('should handle thrown errors in effect', async () => {
    const effect = context$ => context$.pipe(
      map(() => {
        throw new Error('Effect error');
      }),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 500,
      body: expect.stringContaining('Effect error')
    }));
  });

  it('should handle errors in provider initialization', async () => {
    const providers = {
      errorService: () => {
        throw new Error('Provider init failed');
      }
    };
    
    const effect = context$ => context$.pipe(
      map(() => ({ result: 'should not reach' })),
      ok()
    );
    
    const handler = twilioEffect(effect, { providers });
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 500,
      body: expect.stringContaining('Provider init failed')
    }));
  });

  it('should handle complex effect with multiple operators', async () => {
    const effect = context$ => context$.pipe(
      requireFields('To', 'Body'),
      map(ctx => ({
        to: ctx.event.To,
        body: ctx.event.Body,
        domain: ctx.context.DOMAIN_NAME
      })),
      switchMap(data => of({
        ...data,
        processed: true
      })),
      ok(),
      handleError()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: {
        to: '+1234567890',
        body: 'Test message',
        domain: 'test.twilio.com',
        processed: true
      }
    }));
  });

  it('should pass environment variables', async () => {
    const contextWithEnv = {
      ...mockContext,
      ENVIRONMENT: 'production',
      API_KEY: 'test-key'
    };
    
    const effect = context$ => context$.pipe(
      map(ctx => ({
        env: {
          ENVIRONMENT: ctx.env.ENVIRONMENT,
          API_KEY: ctx.env.API_KEY
        },
        hasApiKey: !!ctx.env.API_KEY
      })),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(contextWithEnv, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: {
        env: {
          ENVIRONMENT: 'production',
          API_KEY: 'test-key'
        },
        hasApiKey: true
      }
    }));
  });

  it('should handle request headers and cookies', async () => {
    const eventWithRequest = {
      ...mockEvent,
      _headers: {
        'authorization': 'Bearer token123',
        'content-type': 'application/json'
      },
      _cookies: {
        session: 'abc123',
        preference: 'dark-mode'
      }
    };
    
    const effect = context$ => context$.pipe(
      map(ctx => ({
        hasAuth: !!ctx.request.headers.authorization,
        hasSession: !!ctx.request.cookies.session,
        contentType: ctx.request.headers['content-type']
      })),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, eventWithRequest, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: {
        hasAuth: true,
        hasSession: true,
        contentType: 'application/json'
      }
    }));
  });

  it('should handle empty event', async () => {
    const effect = context$ => context$.pipe(
      map(ctx => ({ eventKeys: Object.keys(ctx.event) })),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, {}, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: { eventKeys: [] }
    }));
  });

  it('should handle direct Response returns', async () => {
    const effect = context$ => context$.pipe(
      map(() => new Response({ custom: 'response' }, 201))
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 201,
      body: { custom: 'response' }
    }));
  });

  it('should handle observable errors', async () => {
    const effect = context$ => context$.pipe(
      switchMap(() => throwError(new Error('Observable error'))),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 500,
      body: expect.stringContaining('Observable error')
    }));
  });

  it('should work with no providers', async () => {
    const effect = context$ => context$.pipe(
      map(ctx => ({ 
        hasProviders: !!ctx.providers,
        providerCount: Object.keys(ctx.providers || {}).length 
      })),
      ok()
    );
    
    const handler = twilioEffect(effect);
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      statusCode: 200,
      body: {
        hasProviders: true,
        providerCount: 0
      }
    }));
  });
});