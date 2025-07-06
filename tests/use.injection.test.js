const { useInjection, Result } = require('../dist');

describe('useInjection', () => {
  // Mock Twilio handler parameters
  const mockContext = {
    getTwilioClient: jest.fn(() => ({
      messages: { create: jest.fn() },
      calls: { create: jest.fn() }
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

  it('should inject function with providers and environment', async () => {
    const testEnv = {
      API_KEY: 'test-key',
      API_SECRET: 'test-secret'
    };
    
    const providers = {
      customerService: async function() {
        return {
          getCustomer: (id) => ({ id, name: 'John Doe' })
        };
      }
    };
    
    const handler = useInjection(async function() {
      // env is derived from context, not from options
      expect(this.providers).toBeDefined();
      expect(this.client).toBeDefined();
      
      const customer = this.providers.customerService.getCustomer('123');
      return Result.ok({ customer });
    }, { providers });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      _body: { customer: { id: '123', name: 'John Doe' } },
      _statusCode: 200
    }));
  });

  it('should handle Result.ok responses', async () => {
    const handler = useInjection(async function() {
      return Result.ok({ success: true });
    });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _data: { success: true },
      _error: undefined
    });
  });

  it('should handle Result.failed responses', async () => {
    const handler = useInjection(async function() {
      return Result.failed({ error: 'Something went wrong' });
    });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _data: undefined,
      _error: { error: 'Something went wrong' }
    });
  });

  it('should handle thrown errors', async () => {
    const handler = useInjection(async function() {
      throw new Error('Unexpected error');
    });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      _statusCode: 500,
      _body: expect.stringContaining('Unexpected error')
    }));
  });

  it('should handle direct Response returns', async () => {
    const { Response } = require('../dist');
    
    const handler = useInjection(async function() {
      return new Response({ message: 'Custom response' }, 201);
    });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      _statusCode: 201,
      _body: { message: 'Custom response' }
    }));
  });

  it('should inject request data from event', async () => {
    const eventWithHeaders = {
      ...mockEvent,
      request: {
        headers: {
          'authorization': 'Bearer token123',
          'content-type': 'application/json'
        },
        cookies: {
          session: 'abc123'
        }
      }
    };
    
    const handler = useInjection(async function() {
      expect(this.request.headers['authorization']).toBe('Bearer token123');
      expect(this.request.cookies.session).toBe('abc123');
      return Result.ok({ received: true });
    });
    
    await handler(mockContext, eventWithHeaders, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.any(Object));
  });

  it('should work with provider factories returning observables', async () => {
    const providers = {
      dataService: async function() {
        return { getData: () => 'observable data' };
      }
    };
    
    const handler = useInjection(async function() {
      const data = this.providers.dataService.getData();
      return Result.ok({ data });
    }, { providers });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _data: { data: 'observable data' },
      _error: undefined
    });
  });

  it('should handle provider initialization errors', async () => {
    const providers = {
      errorService: function() {
        throw new Error('Provider init failed');
      }
    };
    
    const handler = useInjection(async function() {
      return Result.ok({ success: true });
    }, { providers });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      _statusCode: 200,
      _body: { success: true }
    }));
  });

  it('should pass event data to function context', async () => {
    const handler = useInjection(async function() {
      expect(this.event).toEqual(mockEvent);
      expect(this.event.To).toBe('+1234567890');
      expect(this.event.Body).toBe('Test message');
      return Result.ok({ eventReceived: true });
    });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _data: { eventReceived: true },
      _error: undefined
    });
  });

  it('should handle async provider factories', async () => {
    const providers = {
      asyncService: async function() {
        await new Promise(resolve => setTimeout(resolve, 10));
        return { getValue: () => 'async value' };
      }
    };
    
    const handler = useInjection(async function() {
      const value = this.providers.asyncService.getValue();
      return Result.ok({ value });
    }, { providers });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, {
      _data: { value: 'async value' },
      _error: undefined
    });
  });

  it('should handle functions returning plain objects', async () => {
    const handler = useInjection(async function() {
      return { message: 'Plain object response' };
    });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      _statusCode: 200,
      _body: { message: 'Plain object response' }
    }));
  });

  it('should handle empty responses', async () => {
    const handler = useInjection(async function() {
      // Return nothing
    });
    
    await handler(mockContext, mockEvent, mockCallback);
    
    expect(mockCallback).toHaveBeenCalledWith(null, expect.objectContaining({
      _statusCode: 200,
      _body: {}
    }));
  });
});