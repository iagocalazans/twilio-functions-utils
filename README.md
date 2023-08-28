
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

The lib provides a function `useInjection` who returns a brand function for every execution. This returned function is ready to receive the Twilio Handler arguments and make them available as `this`  properties as `this.request`, `this.cookies`, `this.twilio`, `this.env` and `this.env` at the Function level.

### # useInjection(Function, Options) <sup><sub>Function</sub></sup>

The useInjection method takes two parameters. The first to apply as a handler and the last is an object of configuration options.

##### [useInjection] Function <sup><sub>Function</sub></sup>

Must be writen in standard format, this will be your `handler` function.

```js
  function createSomeThing (event) {
    ...
  }
```

##### [useInjection] Options.validateToken <sup><sub>Boolean</sub></sup>

You can pass `validateToken` equal true to force Flex Token validation using [Twilio Flex Token Validator](https://github.com/twilio/twilio-flex-token-validator)

```js
useInjection(yourFunction,
  {
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

### # pipe(...functions) <sup><sub>Function</sub></sup>

The pipe method could receive as many parameters as you desire. They will be called one after another.

##### [pipe] ...functions <sup><sub>Function[]</sub></sup>

Any sync function.

##### [pipe] Usage

```js
  const sum1 = (x) => x + 1;
  const sum2 = (x) => x + 2;
  const sum3 = (x) => x + 3;

  const sum = pipe(sum1, sum2, sum3);
  const result = sum(1) // return 7
```

### # transformListTo(TwilioInstanceList, Function) <sup><sub>Function</sub></sup>

The transformListTo method takes two parameters. The first to apply as a handler and the last is a transformation function.

##### [transformListTo] TwilioInstanceList <sup><sub>TwilioInstanceList</sub></sup>

A Twilio Instance List method as `twilio.calls.list` or `twilio.records.list`.

##### [transformListTo] Function <sup><sub>Function</sub></sup>

A transformation function. You could use one of lib defaults as `extract` or `factory`.

##### [transformListTo] Usage

```js
  const getCallSidList = transformListTo(twilio.calls.list, extract('sid')); 
  const callSidList = await getCallSidList(); // returns ['CA****', 'CA****', 'CA****', 'CA****']
```

### # transformInstanceTo(TwilioInstance, Function) <sup><sub>Function</sub></sup>

The transformInstanceTo method takes two parameters. The first to apply as a handler and the last is a transformation function.

##### [transformInstanceTo] TwilioInstance <sup><sub>TwilioInstance</sub></sup>

A Twilio Instance method as `twilio.calls` or `twilio.records`.

##### [transformInstanceTo] Function <sup><sub>Function</sub></sup>

A transformation function. You could use one of lib defaults as `extract` or `factory`.

##### [transformInstanceTo] Usage

```js
  const getToNumber = transformInstanceTo(twilio.calls, extract('to'));
  const toNumber = await getToNumber('CA****'); // returns "+956798915489"
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

Get the `context`, `event` and `request data` just by deconstructing the object this:

```js
  const { cookies, request, env, twilio, ...YOUR_BODY_VALUES } = this
```

Combine multiple functions to change the final result using one of the new
`transformListTo` and `transformInstanceTo` methods:

```js
// File: functions/create-action.js

const { useInjection, Response, transformListTo, extract } = require('twilio-functions-utils');

async function createAction(event) {
  const { cookies, request, env, twilio, ...attributes } = this

  const findFromAttributes = transformListTo(twilio.calls.list, extract('sid'))

  const calls = await findFromAttributes(attributes);

  return new Response(calls, 200);
}

exports.handler = useInjection(createAction, {
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
  const something = await someFunction(event)
  return Response(something)
}

const handler = useInjection(functionToBeTested);

module.exports = { functionToBeTested, handler }; // <--
```

**(Required)** You always need to import the `twilio.mock` for Response Twilio Global object on your testing files begining.

```js
require('twilio-functions-utils/lib/twilio.mock');
```

Use Twilio Functions Utils `useMock` to do the hard job and just write your tests with the generated function.
You can use `Twilio.mockRequestResolvedValue`, `Twilio.mockRequestImplementation`, `Twilio.mockRequestRejectedValue` to Mock your Twilio API requests.

```js
/* global describe, it, expect */

require('twilio-functions-utils/lib/twilio.mock');

const { useMock, Response } = require('twilio-functions-utils');
const { functionToBeTested } = require('../../functions/functionToBeTested'); // <-- Import here!

// Create the test function from the function to be tested
const fn = useMock(functionToBeTested, {
  env: {
    YOUR_ENV_VAR: 'value'
  },
  twilio: {
    functionToMock: {}
  }
});

describe('Function functionToBeTested', () => {
  it('if {"someValue": true}', async () => {
    const request = { TaskSid: '1234567', TaskAttributes: '{"someValue": true}' };

    Twilio.mockRequestResolvedValue({
      statusCode: 200,
      body: {
        sid: '1234567'
      }
    })
    
    Twilio.mockRequestResolvedValue({
      statusCode: 200,
      body: {
        key: "MP****",
        data: { sid: '7654321' }
      }
    })

    const res = await fn(request);
    
    const customMap = await Runtime.getSync().maps("MP****").fetch();

    expect(res).toBeInstanceOf(Response);
    expect(res.body).not.toEqual(request);
    expect(res.data).toEqual({ sid: '7654321' });
    expect(res.body).toEqual({ sid: '1234567' });
  });
});
```

## AUTHOR

- [Iago Calazans](https://github.com/iagocalazans) - 🛠 Senior Node.js Engineer at [Stone](https://www.stone.com.br/)
