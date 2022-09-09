/* global jest, describe, it, expect, Runtime, Twilio */

require('../lib/twilio.mock');
const fs = require('fs');

const fsCalls = jest.spyOn(fs, 'existsSync');

const {
  useMock,
  BadRequestError,
  InternalServerError,
  Response,
  TwiMLResponse,
  NotFoundError,
  UnauthorizedError,
} = require('../index');

const responseTypes = {
  twiml: (provided) => new TwiMLResponse(provided.twiml),
  badRequest: () => new BadRequestError(),
  internalServer: () => new InternalServerError(),
  notFound: () => new NotFoundError(),
  response: (provided) => new Response({ ...provided }),
  responseAsString: (provided) => new Response(provided.message),
};

const { functionUsedToTest } = require(Runtime.getFunctions()['use-to-test'].path);
const { assetUsedToTest } = require(Runtime.getAssets()['/use-to-test.js'].path);

async function useItToMock(event) {
  const provided = this.providers.useItAsProvider(event);

  if (event.forceFail) {
    throw new Error('Check fail condition!');
  }

  if (event.forceUnauthorized) {
    // eslint-disable-next-line no-throw-literal
    throw 'forceUnauthorized condition!';
  }

  const reprovided = await this.providers
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
});

describe('Function useMock', () => {
  it('Should respond with an InternalServerError Instance', async () => {
    Twilio.mockRequestResolvedValue({
      statusCode: 200,
      body: {
        sid: 'CA****', account_sid: 'AC****', to: '+55***********', from: '+55***********', parent_call_sid: 'CA****',
      },
    });
    const callback = await fn({
      type: 'internalServer', forceFail: false, to: '+55***********', from: '+55***********',
    });

    expect(callback).toBeInstanceOf(InternalServerError);
    expect(callback.body).toEqual('[ InternalServerError ]: The server encountered an unexpected condition that prevented it from fulfilling the request!');
  });

  it('Should respond with an InternalServerError Instance', async () => {
    const callback = await fn({ type: 'internalServer', forceFail: true });

    expect(callback).toBeInstanceOf(InternalServerError);
    expect(callback.body).toEqual('[ InternalServerError ]: Error: Check fail condition!');
  });

  it('Should respond with a Response Instance', async () => {
    Twilio.mockRequestResolvedValue({
      statusCode: 200,
      body: {
        sid: 'CA****', account_sid: 'AC****', to: '+55*****1*****', from: '+55*****2*****', parent_call_sid: 'CA****',
      },
    });
    const callback = await fn({
      type: 'response', forceFail: false, to: '+55*****1*****', from: '+55*****2*****',
    });

    expect(callback).toBeInstanceOf(Response);
    expect(callback.body).toMatchObject({
      sid: 'CA****',
      parentCallSid: 'CA****',
      accountSid: 'AC****',
      to: '+55*****1*****',
      from: '+55*****2*****',
    });
  });

  it('Should respond with an UnauthorizedError Instance', async () => {
    const callback = await fn({ type: 'response', forceFail: false, forceUnauthorized: true });

    expect(callback).toBeInstanceOf(UnauthorizedError);
    expect(callback.body).toMatch('[ UnauthorizedError ]: forceUnauthorized condition!');
  });

  it('Should find paths for getFunctions and getAssets', async () => {
    expect(fsCalls).toHaveBeenCalled();

    expect(Runtime.getFunctions()['use-to-test'].path).toBe(`${process.cwd()
    }/functions/use-to-test`);
    expect(Runtime.getAssets()['/use-to-test.js'].path).toBe(`${process.cwd()
    }/assets/use-to-test`);
  });

  it('Should throw an error while creating a syncMapItems without key', async () => {
    try {
      await Runtime.getSync().maps('SN****').syncMapItems.create({ data: { notToTeste: 'something' } });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch("Required parameter \"opts['key']\" missing.");
    }
  });

  it('Should find paths for getSync', async () => {
    Twilio.mockRequestResolvedValue({
      statusCode: 201,
      body: { key: 'Call-undefined', data: { value: 'first' } },
    });

    Twilio.mockRequestResolvedValue({
      statusCode: 200,
      body: { key: 'Call-undefined', data: { teste: 'postUpdate' } },
    });

    const maps = await Runtime.getSync().maps('SN****').syncMapItems('SI****').fetch();

    expect(maps.data).toEqual({ value: 'first' });

    const updatedMaps = await maps.update({ teste: 'postUpdate' });

    expect(updatedMaps.data).toEqual({ teste: 'postUpdate' });
  });
});
