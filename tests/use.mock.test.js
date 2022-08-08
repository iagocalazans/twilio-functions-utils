/* global describe, it, expect, Runtime */

require('../lib/twilio.mock');

const {
  useMock,
  BadRequestError,
  InternalServerError,
  Response,
  TwiMLResponse,
  NotFoundError,
} = require('../index');

const responseTypes = {
  twiml: (provided) => new TwiMLResponse(provided.twiml),
  badRequest: () => new BadRequestError(),
  internalServer: () => new InternalServerError(),
  notFound: () => new NotFoundError(),
  response: (provided) => new Response(provided),
  responseAsString: (provided) => new Response(provided.message),
};

const { functionUsedToTest } = require(Runtime.getFunctions()['use-to-test'].path);
const { assetUsedToTest } = require(Runtime.getAssets()['/use-to-test.js'].path);

function useItToMock(event) {
  const provided = this.providers.useItAsProvider(event);

  if (event.forceFail) {
    throw new Error('Check fail condition!');
  }

  const reprovided = this.providers
    .functionUsedToTest(this.providers
      .assetUsedToTest(event));

  return responseTypes[provided.type](reprovided);
}

function useItAsProvider(event) {
  Object.defineProperty(
    event, 'evaluated', {
      value: true,
      enumerable: true,
    },
  );

  return event;
}

const fn = useMock(useItToMock, {
  providers: {
    useItAsProvider,
    functionUsedToTest,
    assetUsedToTest,
  },
  env: {
    SOMETEST_VAR: 'VariableDefined',
  },
  client: {
    someFunction: (value) => value,
  },
});

describe('Function useMock', () => {
  it('Should respond with an InternalServerError Instance', async () => {
    const callback = await fn({ type: 'internalServer', forceFail: false });

    expect(callback).toBeInstanceOf(InternalServerError);
    expect(callback.body).toEqual('[ InternalServerError ]: The server encountered an unexpected condition that prevented it from fulfilling the request!');
  });

  it('Should respond with a Response Instance', async () => {
    const callback = await fn({ type: 'response', forceFail: false });

    expect(callback).toBeInstanceOf(Response);
    expect(callback.body).toEqual({ evaluated: true, forceFail: false, type: 'response' });
  });
});
