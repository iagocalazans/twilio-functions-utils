/**
 * Backward Compatibility Test
 * 
 * This example shows that the new RxJS-based implementation
 * maintains 100% compatibility with the original API.
 * 
 * All existing code should work exactly the same way!
 */

const { useInjection, Response, BadRequestError, Result } = require('twilio-functions-utils');

// Example provider (same as original documentation)
const createProvider = async function (event) {
  const { client, env } = this;

  return Result.ok(await new Promise((resolve, reject) => {
    const random = Math.random();

    if (random >= 0.5) {
      return resolve({ success: 'Resolved' });
    }
  
    return reject(new Error('Unresolved'));
  }));
};

// Example handler function (exactly from README.md)
async function createAction(event) {
  const { cookies, request, env } = this;
  const providerResult = await this.providers.create(event);

  if (providerResult.isError) {
    return new BadRequestError(providerResult.error);
  }

  return new Response(providerResult.data, 201);
}

// Export handler exactly like the original documentation
exports.handler = useInjection(createAction, {
  providers: {
    create: createProvider,
  },
  validateToken: false, // Set to true if you want Flex token validation
});

/**
 * Key Points:
 * 
 * 1. ✅ Same `useInjection` function signature
 * 2. ✅ Same `this.providers`, `this.env`, `this.request`, `this.cookies` access
 * 3. ✅ Same provider pattern with `this.client` and `this.env`
 * 4. ✅ Same Result pattern support
 * 5. ✅ Same Response classes and error handling
 * 6. ✅ Same validateToken option for Flex
 * 7. ✅ Same testing with useMock (works identically)
 * 
 * But now powered by RxJS streams under the hood for:
 * - Better composition
 * - Improved error handling
 * - Better testing capabilities
 * - More predictable behavior
 * - Stream-based processing
 */

// Example with TwiML (also works exactly the same)
const { TwiMLResponse } = require('twilio-functions-utils');
const { VoiceResponse } = require('twilio').twiml;

async function voiceHandler(event) {
  const { env } = this;
  
  const twiml = new VoiceResponse();
  twiml.say('Hello from RxJS-powered Twilio Functions!');
  
  return new TwiMLResponse(twiml.toString());
}

exports.voiceHandler = useInjection(voiceHandler);

// Example with async/await provider
const asyncProvider = async function (customerId) {
  const { client, env } = this;
  
  try {
    // Simulate API call
    const customer = await client.api.v2010.accounts(env.ACCOUNT_SID)
      .calls
      .list({ limit: 1 });
      
    return Result.ok({ customer: customer[0] });
  } catch (error) {
    return Result.failed(error);
  }
};

async function customerHandler(event) {
  const result = await this.providers.getCustomer(event.customerId);
  
  if (result.isError) {
    return new BadRequestError('Customer not found');
  }
  
  return new Response(result.data);
}

exports.customerHandler = useInjection(customerHandler, {
  providers: {
    getCustomer: asyncProvider
  }
});