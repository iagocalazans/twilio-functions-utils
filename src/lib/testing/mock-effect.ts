import { Observable, of } from 'rxjs';
import * as Twilio from 'twilio';
import { 
  EffectWithContext, 
  EffectContext, 
  EffectOptions,
  ProvidersFactory
} from '../effects/types';
import { Response } from '../responses/default.response';

interface MockEffectOptions<Env = {}, Providers = {}> extends EffectOptions<Env, Providers> {
  event?: any;
  env?: Env;
  client?: Partial<Twilio.Twilio>;
  headers?: { [key: string]: string };
  cookies?: { [key: string]: string };
}

/**
 * Creates a mock effect for testing
 */
export function mockEffect<Env = {}, Providers = {}, Response = any>(
  effect: EffectWithContext<Env, Providers, Response>,
  options: MockEffectOptions<Env, Providers> = {}
): Observable<Response> {
  // Create mock Twilio client
  const mockClient = {
    ...createMockTwilioClient(),
    ...(options.client || {})
  } as Twilio.Twilio;
  
  // Create mock environment
  const mockEnv = (options.env || {}) as Env;
  
  // Initialize providers
  const providers = initializeMockProviders(
    options.providers,
    { client: mockClient, env: mockEnv }
  ) as Providers;
  
  // Create mock event
  const mockEvent = {
    ...(options.event || {}),
    _headers: options.headers || {},
    _cookies: options.cookies || {}
  };
  
  // Create mock context
  const mockContext: EffectContext<Env, Providers> = {
    event: mockEvent,
    context: {
      getTwilioClient: () => mockClient,
      ...mockEnv
    } as any,
    env: mockEnv,
    providers,
    client: mockClient,
    request: {
      headers: options.headers || {},
      cookies: options.cookies || {}
    }
  };
  
  // Execute effect
  return effect(of(mockContext));
}

/**
 * Tests an effect and returns the result
 */
export async function testEffect<Env = {}, Providers = {}, Response = any>(
  effect: EffectWithContext<Env, Providers, Response>,
  options: MockEffectOptions<Env, Providers> = {}
): Promise<Response> {
  return mockEffect(effect, options).toPromise() as Promise<Response>;
}

/**
 * Creates a test harness for effects
 */
export function createEffectTestHarness<Env = {}, Providers = {}>() {
  const defaultOptions: MockEffectOptions<Env, Providers> = {
    env: {} as Env,
    providers: {} as any,
    event: {},
    headers: {},
    cookies: {}
  };
  
  return {
    /**
     * Set default environment variables
     */
    withEnv(env: Env) {
      defaultOptions.env = env;
      return this;
    },
    
    /**
     * Set default providers
     */
    withProviders(providers: any) {
      defaultOptions.providers = providers;
      return this;
    },
    
    /**
     * Set default client mock
     */
    withClient(client: Partial<Twilio.Twilio>) {
      defaultOptions.client = client;
      return this;
    },
    
    /**
     * Test an effect with the configured defaults
     */
    async test<Response = any>(
      effect: EffectWithContext<Env, Providers, Response>,
      overrides: MockEffectOptions<Env, Providers> = {}
    ): Promise<Response> {
      return testEffect(effect, { ...defaultOptions, ...overrides });
    },
    
    /**
     * Create an observable for testing
     */
    mock<Response = any>(
      effect: EffectWithContext<Env, Providers, Response>,
      overrides: MockEffectOptions<Env, Providers> = {}
    ): Observable<Response> {
      return mockEffect(effect, { ...defaultOptions, ...overrides });
    }
  };
}

function createMockTwilioClient(): Partial<Twilio.Twilio> {
  return {
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'mock-message-sid' })
    } as any,
    calls: {
      create: jest.fn().mockResolvedValue({ sid: 'mock-call-sid' })
    } as any,
    taskrouter: {
      workspaces: jest.fn(() => ({
        tasks: {
          create: jest.fn().mockResolvedValue({ sid: 'mock-task-sid' })
        }
      }))
    } as any,
    sync: {
      services: jest.fn(() => ({
        documents: jest.fn(() => ({
          fetch: jest.fn().mockResolvedValue({ data: {} }),
          update: jest.fn().mockResolvedValue({ data: {} })
        }))
      }))
    } as any
  };
}

function initializeMockProviders<Env, Providers>(
  providersFactory: any,
  context: { client: Twilio.Twilio; env: Env }
): Providers {
  if (!providersFactory) {
    return {} as Providers;
  }
  
  const providers: any = {};
  
  for (const [key, factory] of Object.entries(providersFactory)) {
    providers[key] = (factory as any)(context);
  }
  
  return providers as Providers;
}