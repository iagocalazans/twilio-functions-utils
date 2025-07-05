/**
 * Example: RxJS-based Twilio Functions with Effects
 * 
 * This demonstrates the new RxJS-based API that provides a reactive,
 * functional approach to building Twilio Functions.
 */

const { 
  twilioEffect,
  injectEvent,
  injectEnv,
  injectClient,
  injectProviders,
  requireFields,
  ok,
  handleError,
  validateFlexToken,
  toTwiMLResponse 
} = require('twilio-functions-utils');

const { switchMap, map, mergeMap } = require('rxjs/operators');
const { VoiceResponse } = require('twilio').twiml;

// Example 1: Simple SMS sending effect
const sendSmsEffect = context$ => 
  context$.pipe(
    requireFields('To', 'Body'),
    injectMany({
      event: ctx => ctx.event,
      client: ctx => ctx.client
    }),
    switchMap(({ event, client }) =>
      client.messages.create({
        to: event.To,
        from: event.From || '+1234567890',
        body: event.Body
      })
    ),
    map(message => ({ success: true, sid: message.sid })),
    ok(),
    handleError()
  );

// Example 2: Flex-authenticated effect with providers
const flexEffect = context$ =>
  context$.pipe(
    validateFlexToken(),
    injectProviders(),
    switchMap(providers =>
      providers.taskService.createTask({
        attributes: JSON.stringify({ customer: 'John Doe' })
      })
    ),
    ok(),
    handleError()
  );

// Example 3: TwiML voice response effect
const voiceEffect = context$ =>
  context$.pipe(
    injectEvent(),
    map(event => {
      const response = new VoiceResponse();
      
      if (event.Digits === '1') {
        response.say('You pressed 1. Connecting to sales.');
        response.dial('+1234567890');
      } else if (event.Digits === '2') {
        response.say('You pressed 2. Connecting to support.');
        response.dial('+0987654321');
      } else {
        response.say('Please press 1 for sales or 2 for support.');
        response.gather({
          numDigits: 1,
          action: '/voice-menu'
        });
      }
      
      return response;
    }),
    toTwiMLResponse(),
    handleError()
  );

// Example 4: Complex business logic with error handling and retries
const complexBusinessLogicEffect = context$ =>
  context$.pipe(
    requireFields('customerId'),
    injectMany({
      event: ctx => ctx.event,
      env: ctx => ctx.env,
      providers: ctx => ctx.providers
    }),
    switchMap(({ event, env, providers }) =>
      providers.customerService.getCustomer(event.customerId)
    ),
    switchMap(customer =>
      customer.subscriptions.pipe(
        map(subscriptions => ({
          customer: customer.name,
          activeSubscriptions: subscriptions.filter(s => s.active).length,
          totalValue: subscriptions.reduce((sum, s) => sum + s.value, 0)
        }))
      )
    ),
    ok({ 'Cache-Control': 'max-age=300' }),
    handleError(error => {
      if (error.code === 'CUSTOMER_NOT_FOUND') {
        return new Response({ error: 'Customer not found' }, 404);
      }
      return null; // Use default error handling
    })
  );

// Export Twilio handlers
exports.sendSms = twilioEffect(sendSmsEffect);

exports.flexHandler = twilioEffect(flexEffect, {
  providers: {
    taskService: ({ client, env }) => ({
      createTask: (attributes) => 
        client.taskrouter
          .workspaces(env.WORKSPACE_SID)
          .tasks
          .create(attributes)
    })
  }
});

exports.voiceMenu = twilioEffect(voiceEffect);

exports.customerData = twilioEffect(complexBusinessLogicEffect, {
  providers: {
    customerService: ({ client, env }) => ({
      getCustomer: (id) => 
        // This would typically be a database call or API request
        Promise.resolve({
          id,
          name: 'John Doe',
          subscriptions: [
            { id: 1, active: true, value: 99.99 },
            { id: 2, active: false, value: 49.99 }
          ]
        })
    })
  }
});

/**
 * Key Benefits of the RxJS Effects approach:
 * 
 * 1. **Reactive Streams**: All operations are streams that can be composed,
 *    transformed, and combined using RxJS operators.
 * 
 * 2. **Functional Composition**: Build complex logic by composing simple,
 *    reusable operators.
 * 
 * 3. **Built-in Error Handling**: Comprehensive error handling with proper
 *    HTTP status codes and response formatting.
 * 
 * 4. **Type Safety**: Full TypeScript support with proper type inference
 *    across the entire stream pipeline.
 * 
 * 5. **Testing**: Easy to test with marble testing and mock streams.
 * 
 * 6. **Declarative**: Express what you want to happen, not how to do it.
 * 
 * 7. **Operator Library**: Rich set of operators for common patterns like
 *    validation, authentication, response formatting, and error handling.
 */