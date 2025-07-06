const { useMock, Result } = require('../dist');

describe('useMock', () => {
  // Ensure NODE_ENV is test
  beforeAll(() => {
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create testable version of function', async () => {
    const testFunction = async function() {
      return Result.ok({ 
        message: 'Test response',
        env: this.env.TEST_VAR
      });
    };

    const { response } = await useMock(testFunction, {
      env: { TEST_VAR: 'test-value' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      message: 'Test response',
      env: 'test-value'
    });
  });

  it('should inject providers', async () => {
    const testFunction = async function() {
      const user = await this.providers.userService.getUser('123');
      return Result.ok({ user });
    };

    const { response } = await useMock(testFunction, {
      providers: {
        userService: async function() {
          return {
            getUser: (id) => ({ id, name: 'Test User' })
          };
        }
      }
    });

    expect(response.body).toEqual({
      user: { id: '123', name: 'Test User' }
    });
  });

  it('should handle errors', async () => {
    const testFunction = async function() {
      throw new Error('Test error');
    };

    const { response } = await useMock(testFunction);

    expect(response.statusCode).toBe(500);
    expect(response.body).toContain('Test error');
  });

  it('should inject event data', async () => {
    const testFunction = async function() {
      return Result.ok({
        to: this.event.To,
        body: this.event.Body
      });
    };

    const { response } = await useMock(testFunction, {
      event: {
        To: '+1234567890',
        Body: 'Test message'
      }
    });

    expect(response.body).toEqual({
      to: '+1234567890',
      body: 'Test message'
    });
  });

  it('should provide Twilio client', async () => {
    const testFunction = async function() {
      const hasClient = !!this.client;
      const hasMessages = !!this.client.messages;
      return Result.ok({ hasClient, hasMessages });
    };

    const { response } = await useMock(testFunction);

    expect(response.body).toEqual({
      hasClient: true,
      hasMessages: true
    });
  });

  it('should handle Result.failed', async () => {
    const testFunction = async function() {
      return Result.failed({ error: 'Validation failed' });
    };

    const { response } = await useMock(testFunction);

    expect(response.statusCode).toBe(400);
    expect(response.body).toContain('Validation failed');
  });

  it('should handle plain object returns', async () => {
    const testFunction = async function() {
      return { plain: 'object' };
    };

    const { response } = await useMock(testFunction);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ plain: 'object' });
  });

  it('should inject request headers and cookies', async () => {
    const testFunction = async function() {
      return Result.ok({
        authHeader: this.request.headers.authorization,
        sessionCookie: this.request.cookies.session
      });
    };

    const { response } = await useMock(testFunction, {
      event: {
        request: {
          headers: { authorization: 'Bearer token' },
          cookies: { session: 'abc123' }
        }
      }
    });

    expect(response.body).toEqual({
      authHeader: 'Bearer token',
      sessionCookie: 'abc123'
    });
  });

  it('should handle async provider initialization', async () => {
    const testFunction = async function() {
      const data = await this.providers.asyncService.getData();
      return Result.ok({ data });
    };

    const { response } = await useMock(testFunction, {
      providers: {
        asyncService: async function() {
          await new Promise(resolve => setTimeout(resolve, 10));
          return {
            getData: () => 'async data'
          };
        }
      }
    });

    expect(response.body).toEqual({ data: 'async data' });
  });

  it('should throw error if not in test environment', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const testFunction = async function() {
      return Result.ok({});
    };

    await expect(async () => {
      await useMock(testFunction);
    }).rejects.toThrow();

    process.env.NODE_ENV = originalEnv;
  });

  it('should provide context similar to real Twilio', async () => {
    const testFunction = async function() {
      return Result.ok({
        hasTwilioClient: typeof this.client.messages.create === 'function',
        hasEnv: typeof this.env === 'object',
        hasProviders: typeof this.providers === 'object',
        hasEvent: typeof this.event === 'object'
      });
    };

    const { response } = await useMock(testFunction);

    expect(response.body).toEqual({
      hasTwilioClient: true,
      hasEnv: true,
      hasProviders: true,
      hasEvent: true
    });
  });
});