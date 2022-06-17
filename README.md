
# Twilio Functions Utils

<img src="https://avatars.githubusercontent.com/u/109142?s=200&v=4" width="100" />

## About

This lib was created with the aim of simplifying the use of serverless Twilio, reducing the need to apply frequent try-catches and improving context management, making it no longer necessary to return the callback() method in all functions.

## How it works

### useInjection

The useInjection method takes two parameters. The first to apply as a handler and the last is an object of configuration options.

##### [useInjection] Options

Can contain providers that will be defined, which act as use cases to perform internal actions in the handler function through the "this" method.

You can pass `validateToken` equal true too, to force Token validation using [Twilio Flex Token Validator](https://github.com/twilio/twilio-flex-token-validator)

```js
useInjection(yourFunction,
  {
    providers: { create, remove },
    validateToken: true
  }
);
```

##### [Twilio Flex Token Validator](https://github.com/twilio/twilio-flex-token-validator)

When using Token Validator, the Request body must contain a valid Token from Twilio.

```js
// Event
{
  Token: "Twilio-Token-Here"
}
```

### Response

The responses coming from the function destined to the handler must be returned as an instance of Response.

Response receives a string and a number (status code):

```js
return new Response('Your pretty answer.', 200);
```

There are two failure response models, BadRequest and NotFound. Its use follows the same model.

```js
const notFound = new NotFoundError('Your error message here.');
const badRequest = new BadRequestError('Your error message here.');
```

### TwiMLResponse

There is a proper response template to use with the TwiML format:

```js
const twimlVoice = new Twilio.twiml
  .VoiceResponse();

const enqueueVoice = twimlVoice
  .enqueue({
    action,
    workflowSid,
  })
  .task('{}');

return new TwiMLResponse(twimlVoice, 201)
```

## Install

```cmd
npm install twilio-functions-utils
```

## Usage

**IMPORTANT TO USE CONVENTIONAL FUNCTIONS** ➜

```js
  function yourFunctionName() {
    // ...
  }
```

`With arrow functions it doesn't work as expected as 'this' cannot be injected correctly.`.

---

```js
// File: assets/create.private.js

exports.create = async function (event) {
  // Here you can acess  Twilio Client as client and Context as env (so you can get env vars).
  const { client, env } = this

  return new Promise((resolve, reject) => {
    const random = Math.random();

    if (random >= 0.5) {
      return resolve({ sucess: 'Resolved' });
    }
  
    return reject(new Error('Unresolved'));
  });
};
```

```js
// File: functions/create.js

const { useInjection, Response } = require('twilio-functions-utils');
const { create } = require(Runtime.getAssets()['/create.js'].path)

/**
 * @param { Record<string, unknown> } event
 * @this { {
 * request: Record<string, unknown>,
 * cookies: Record<string, string>,
 * client: import('twilio').Twilio,
 * env: {
 *      TWILIO_WORKFLOW_SID: string,
 *      DOMAIN_NAME: string
 * },
 * providers: {
 *      create: create,
 * } } }
 * @returns { Promise<unknown> }
 */
async function createAction(event) {
  // You can perform all your "controller" level actions, as you have access to the request headers and cookies.
  const { cookies, request, client, env } = this

  // Then just call the providers you provided to handler by using useInjection.
  const providerResult = await this.providers.create(event)

  // Just put it on a Response object and you are good to go!
  return new Response(providerResult, 201);
}

exports.handler = useInjection(createAction, {
  providers: {
    create,
  },
  validateToken: true, // When using Token Validator, the Request body must contain a valid Token from Twilio.
});
```

## Author

- [Iago Calazans](https://github.com/iagocalazans) - 🛠 Senior Node.js Engineer at [Stone](https://www.stone.com.br/)
