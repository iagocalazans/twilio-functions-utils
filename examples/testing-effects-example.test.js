/**
 * Example: Testing RxJS Effects
 * 
 * This demonstrates how to test Effects using the provided testing utilities.
 */

const { 
  testEffect,
  createEffectTestHarness,
  marbleTest,
  expectEmissions,
  expectError,
  injectEvent,
  injectClient,
  injectProviders,
  requireFields,
  ok,
  handleError
} = require('twilio-functions-utils');

const { map, switchMap } = require('rxjs/operators');

// Example effect to test
const sendSmsEffect = context$ => 
  context$.pipe(
    requireFields('To', 'Body'),
    switchMap(context => {
      const { event, client } = context;
      return client.messages.create({
        to: event.To,
        from: '+1234567890',
        body: event.Body
      });
    }),
    map(message => ({ success: true, sid: message.sid })),
    ok(),
    handleError()
  );

describe('RxJS Effects Testing', () => {
  
  // Example 1: Simple effect testing
  it('should send SMS successfully', async () => {
    const mockClient = {
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'SM123' })
      }
    };

    const result = await testEffect(sendSmsEffect, {
      event: { To: '+1234567890', Body: 'Hello World' },
      client: mockClient
    });

    expect(result.body).toEqual({ success: true, sid: 'SM123' });
    expect(result.statusCode).toBe(200);
    expect(mockClient.messages.create).toHaveBeenCalledWith({
      to: '+1234567890',
      from: '+1234567890',
      body: 'Hello World'
    });
  });

  // Example 2: Testing validation errors
  it('should return 400 for missing fields', async () => {
    const result = await testEffect(sendSmsEffect, {
      event: { To: '+1234567890' } // Missing Body field
    });

    expect(result.statusCode).toBe(400);
    expect(result.body).toMatch(/Missing required fields: Body/);
  });

  // Example 3: Using test harness for multiple tests
  describe('Using test harness', () => {
    let harness;

    beforeEach(() => {
      harness = createEffectTestHarness()
        .withEnv({ ACCOUNT_SID: 'AC123', AUTH_TOKEN: 'auth123' })
        .withClient({
          messages: {
            create: jest.fn().mockResolvedValue({ sid: 'SM123' })
          }
        });
    });

    it('should use configured defaults', async () => {
      const result = await harness.test(sendSmsEffect, {
        event: { To: '+1234567890', Body: 'Test' }
      });

      expect(result.statusCode).toBe(200);
    });

    it('should allow overrides', async () => {
      const customClient = {
        messages: {
          create: jest.fn().mockRejectedValue(new Error('API Error'))
        }
      };

      const result = await harness.test(sendSmsEffect, {
        event: { To: '+1234567890', Body: 'Test' },
        client: customClient
      });

      expect(result.statusCode).toBe(500);
    });
  });

  // Example 4: Marble testing for complex streams
  it('should handle multiple emissions with marble testing', () => {
    marbleTest(({ cold, expectObservable }) => {
      const context$ = cold('a-b-c|', {
        a: { event: { To: '+1', Body: 'First' } },
        b: { event: { To: '+2', Body: 'Second' } },
        c: { event: { To: '+3', Body: 'Third' } }
      });

      const result$ = context$.pipe(
        map(context => context.event),
        map(event => ({ message: `Processed: ${event.Body}` }))
      );

      expectObservable(result$).toBe('a-b-c|', {
        a: { message: 'Processed: First' },
        b: { message: 'Processed: Second' },
        c: { message: 'Processed: Third' }
      });
    });
  });

  // Example 5: Testing error scenarios
  it('should handle client errors', async () => {
    const erroringClient = {
      messages: {
        create: jest.fn().mockRejectedValue(new Error('Twilio API Error'))
      }
    };

    const result = await testEffect(sendSmsEffect, {
      event: { To: '+1234567890', Body: 'Test' },
      client: erroringClient
    });

    expect(result.statusCode).toBe(500);
    expect(result.body).toMatch(/Twilio API Error/);
  });

  // Example 6: Testing with providers
  const effectWithProviders = context$ =>
    context$.pipe(
      injectProviders(),
      switchMap(providers => providers.customerService.getCustomer('123')),
      map(customer => ({ name: customer.name })),
      ok(),
      handleError()
    );

  it('should work with mocked providers', async () => {
    const providers = {
      customerService: {
        getCustomer: jest.fn().mockResolvedValue({ name: 'John Doe' })
      }
    };

    const harness = createEffectTestHarness()
      .withProviders(providers);

    const result = await harness.test(effectWithProviders);

    expect(result.body).toEqual({ name: 'John Doe' });
    expect(providers.customerService.getCustomer).toHaveBeenCalledWith('123');
  });

  // Example 7: Testing async error handling
  it('should handle async errors properly', async () => {
    const effect = context$ =>
      context$.pipe(
        switchMap(() => Promise.reject(new Error('Async error'))),
        ok(),
        handleError()
      );

    await expectError(
      testEffect(effect).catch(err => err)
    );
  });
});

/**
 * Testing Best Practices:
 * 
 * 1. **Mock Dependencies**: Always mock Twilio client and external services
 * 2. **Test Error Paths**: Verify error handling for all failure scenarios
 * 3. **Use Test Harness**: Set up common test configuration with the harness
 * 4. **Marble Testing**: Use marble diagrams for testing complex stream timing
 * 5. **Integration Tests**: Test complete effect flows from input to output
 * 6. **Async Testing**: Properly handle promises and observables in tests
 * 7. **Mock Providers**: Test provider injection and interaction
 */