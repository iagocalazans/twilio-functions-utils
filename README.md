
![Logo](https://avatars.githubusercontent.com/u/109142?s=200&v=4)

# Twilio Functions Utils

This lib was created with the aim of simplifying the use of serverless Twilio, reducing the need to apply frequent try-catches and improving context management, making it no longer necessary to return the callback() method in all functions.

## Badges

![npm](https://img.shields.io/npm/v/twilio-functions-utils?color=white&label=version&logo=npm&style=for-the-badge) ![npm](https://img.shields.io/npm/dw/twilio-functions-utils?color=white&logo=npm&style=for-the-badge) ![Coveralls](https://img.shields.io/coveralls/github/iagocalazans/twilio-functions-utils?color=white&logo=coveralls&style=for-the-badge)

## Installation

Install `twilio-functions-utils` with npm

```bash
  npm install twilio-functions-utils
```

Install `twilio-functions-utils` with yarn

```bash
  yarn add twilio-functions-utils
```

## Features

- Dependency Injection
- Easy testing with DI
- Easy to use utils methods

## Usage/Examples

### Dependency Injection

> Do not use arrow functions, otherwise the injection won't work.

```javascript
// File: assets/create.private.js

const { Try } = require('twilio-functions-utils');

exports.create = async function (event) {
  const { client, env } = this

  return Try.promise(new Promise((resolve, reject) => {
    const random = Math.random();

    if (random >= 0.5) {
      return resolve({ sucess: 'Resolved' });
    }
  
    return reject(new Error('Unresolved'));
  }));
};
```

```javascript
// File: functions/create.js

const { useInjection, Response } = require('twilio-functions-utils');
const { create } = require(Runtime.getAssets()['/create.js'].path)

async function createAction(event) {
  const { cookies, request, env } = this
  const createTry = await this.providers.create(event)

  if (createTry.isError) {
    return new BadRequestError(createTry.error);
  }

  return new Response(createTry.data, 201);
}

exports.handler = useInjection(createAction, {
  providers: {
    create,
  },
  validateToken: true, // When using Token Validator, the Request body must contain a valid Token from Twilio.
});
```

### Testing

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
You can use `Twilio.mockRequestResolvedValue`, `Twilio.mockRequestImplementation`, `Twilio.mockRequestRejectedValue` to Mock your Twilio API requests.

```js
require('twilio-functions-utils/lib/twilio.mock');

const { useMock, Response } = require('twilio-functions-utils');
const { functionToBeTested } = require('../../functions/functionToBeTested'); // <-- Import here!

// Create the test function from the function to be tested
const fn = useMock(functionToBeTested, {
  providers: {
    myCustomProvider: async (sid) => ({ sid }), // Mock the providers implementation.
  },
  env: {
    YOUR_ENV_VAR: 'value'
  },
  client: {
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

## Used By

This project is used by the following companies:

- [Stone Co](https://stone.com.br)

## 🚀 About Me

[Iago Calazans - Senior Software Engineer](https://iagocalazans.dev): JavaScript | Node.js | Nest.js | TypeScript at [Stone Co](https://stone.com.br)

## License

[MIT](https://choosealicense.com/licenses/mit/)
