
# Twilio Functions Utils

<img src="https://avatars.githubusercontent.com/u/109142?s=200&v=4" width="80" />

## ABOUT

![npm](https://img.shields.io/npm/v/twilio-functions-utils?color=white&label=version&logo=npm&style=for-the-badge) ![npm](https://img.shields.io/npm/dw/twilio-functions-utils?color=white&logo=npm&style=for-the-badge) ![npms.io (final)](https://img.shields.io/npms-io/final-score/twilio-functions-utils?color=white&label=score&logo=npm&logoColor=white&style=for-the-badge) ![Coveralls](https://img.shields.io/coveralls/github/iagocalazans/twilio-functions-utils?color=white&logo=coveralls&style=for-the-badge)

This lib was created with the aim of simplifying the use of serverless Twilio, reducing the need to apply frequent try-catches and improving context management, making it no longer necessary to return the callback() method in all functions.

### Install

```cmd
npm install twilio-functions-utils
```

## HOW IT WORKS

The lib provides a function `useInjection` who returns a brand function for every execution. This returned function is ready to receive the Twilio Handler arguments and make them available as `this`  properties as `this.request`, `this.cookies` and `this.env` at the Function level and `this.client` and `this.env` at the Provider function level.

### # useInjection(Function, Options) <sup><sub>Function</sub></sup>

The useInjection method takes two parameters. The first to apply as a handler and the last is an object of configuration options.

##### [useInjection] Function <sup><sub>Function</sub></sup>

Must be writen in standard format, this will be your `handler` function.

```js
  function createSomeThing (event) {
    ...
  }
```

##### [useInjection] Options.providers <sup><sub>Object</sub></sup>

An object that can contain providers that will be defined, which act as use cases to perform internal actions in the handler function through the `this.providers` method.

##### [useInjection] Options.validateToken <sup><sub>Boolean</sub></sup>

You can pass `validateToken` equal true to force Flex Token validation using [Twilio Flex Token Validator](https://github.com/twilio/twilio-flex-token-validator)

```js
useInjection(yourFunction,
  {
    providers: { create, remove },
    validateToken: true
  }
);
```

When using Token Validator, the Request body must contain a valid Token from Twilio Flex.

```js
// Event
{
  Token: "Twilio-Token-Here"
}
```

### Response <sup><sub>Class</sub></sup>

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

### TwiMLResponse <sup><sub>Class</sub></sup>

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

#### Usage

**IMPORTANT TO USE REGULAR FUNCTIONS** ➜ With arrow functions it doesn't work as expected as `this` cannot be injected correctly.

```js
  function yourFunctionName() {
    // ...
  }
```

Separate your actions from the main routine of the code. Break it down into several smaller parts that interact with your event, to facilitate future changes. You can create functions such as Assets or Functions, then just import them through the Runtime and pass them to the provider.

```js
// File: assets/create.private.js

/**
 * @param { object } event
 * @this { {
 * client: import('twilio').Twilio,
 * env: {
 *      TWILIO_WORKFLOW_SID: string,
 *      DOMAIN_NAME: string
 * } } }
 * @returns { Promise<unknown> }
 */
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

In your handler you will have access to the function through the providers property, internal to the this of the function that precedes the handler.

```js
// File: functions/create.js

const { useInjection, Response } = require('twilio-functions-utils');
const { create } = require(Runtime.getAssets()['/create.js'].path)

/**
 * @param { object } event
 * @this { {
 * request: object,
 * cookies: object,
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
  const { cookies, request, env } = this

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

## EXTRAS

### # typeOf(Value) <sup><sub>Function</sub></sup>

A simple method to discovery a value type. This is more specific then the original JavaScript `typeof`.

It will return as `Array`, `Object`, `String`, `Number`, `Symbol`.

##### [typeOf] Value <sup><sub>*</sub></sup>

Could be any JavaScript primitive value to be type checked.

#### Usage

```js
const { typeOf } = require('twilio-functions-utils');

const type = typeOf('my name is Lorem');
const typeArray = typeOf(['one', 'two']);
const original = typeof ['one', 'two']

console.log(type) // String
console.log(typeArray) // Array
console.log(original) // object
```

## TESTING

### # useMock(Function, Options) <sup><sub>Function</sub></sup>

The Twilio Serverless structure make it hard for testing sometimes. So this provides a method that works perfectly with useInjection ready functions. The `useMock` act like useInjection but mocking some required fragments as `getAssets` and `getFunctions`.

###### [useMock] Function <sup><sub>Function</sub></sup>

The same function as used in `useInjection`.

###### [useMock] Options.providers <sup><sub>Object</sub></sup>

Unlike `useInjection`, the `useMock` method only receives the `Options.providers` property.

#### Usage

**(Required)** Set your `jest` testing script with `NODE_ENV=test`:

```
"scripts": {
    "test": "NODE_ENV=test jest --collect-coverage --watchAll",
    "start": "twilio-run",
    "deploy": "twilio-run deploy"
  }
```

Your files structures must be have `assets` and `functions` into first or second levels starting from `src` (when in second level):

```
app/
├─ package.json
├─ node_modules/
├─ src/
│  ├─ functions/
│  ├─ assets/
```

or:

```
app/
├─ package.json
├─ functions/
├─ assets/
├─ node_modules/
```

Exports your function to be tested and your handler so it can be used by Twilio when in runtime:

```js
async function functionToBeTested(event) {
  const something = await this.providers.myCustomProvider(event)
  return Response(something)
}

const handler = useInjection(functionToBeTested, {
  providers: {
    myCustomProvider,
  },
});

module.exports = { functionToBeTested, handler }; // <--
```

**(Required)** You always need to import the `twilio.mock` for Response Twilio Global object on your testing files begining.

```js
require('twilio-functions-utils/lib/twilio.mock');
```

Use Twilio Functions Utils `useMock` to do the hard job and just write your tests with the generated function.

```js
/* global describe, it, expect */

require('twilio-functions-utils/lib/twilio.mock');

const { useMock, Response } = require('twilio-functions-utils');
const { functionToBeTested } = require('../../functions/functionToBeTested'); // <-- Import here!

// Create the test function from the function to be tested
const fn = useMock(functionToBeTested, {
  providers: {
    myCustomProvider: async (sid) => ({ sid }), // Mock the providers implementation.
  },
});

describe('Function functionToBeTested', () => {
  it('if {"someValue": true}', async () => {
    const request = { TaskSid: '1234567', TaskAttributes: '{"someValue": true}' };

    const res = await fn(request);

    expect(res).toBeInstanceOf(Response);
    expect(res.body).not.toEqual(request);
    expect(res.body).toEqual({ sid: '1234567' });
  });
});
```

## AUTHOR

- [Iago Calazans](https://github.com/iagocalazans) - 🛠 Senior Node.js Engineer at [Stone](https://www.stone.com.br/)
