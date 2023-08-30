/* eslint-disable global-require */
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
const { useTwilio, TWILIO_TYPES } = require('../lib/use.injection');

const responseTypes = {
  twiml: (provided) => new TwiMLResponse(provided.twiml),
  badRequest: () => new BadRequestError(),
  internalServer: () => new InternalServerError(),
  notFound: () => new NotFoundError(),
  response: (provided) => new Response({ ...provided }),
  responseAsString: (provided) => new Response(provided.message),
};

const { assetUsedToTest } = require(Runtime.getAssets()['/use-to-test.js'].path);

function useItAsProvider(event) {
  Object.defineProperty(
    event, 'evaluated', {
      value: true,
      enumerable: true,
    },
  );

  return event;
}

async function useItToMock(event) {
  const provided = useItAsProvider(event);

  if (event.forceFail) {
    throw new Error('Check fail condition!');
  }

  if (event.forceUnauthorized) {
    // eslint-disable-next-line no-throw-literal
    throw 'forceUnauthorized condition!';
  }

  const twilio = useTwilio(this);

  const result = await twilio(
    TWILIO_TYPES.Functions, 'functionUsedToTest', 'use-to-test',
  )(assetUsedToTest(event));

  return responseTypes[provided.type](result);
}

const fn = useMock(useItToMock, {
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
    expect(callback.body).toEqual('[ InternalServerError ]: Check fail condition!');
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

  it('Should mock the Twilio mock with a Response Instance', async () => {
    Twilio.mockRequestImplementation(async () => ({
      statusCode: 200,
      body: {
        sid: 'CA****', account_sid: 'AC****', to: '+55*****1*****', from: '+55*****2*****', parent_call_sid: 'CA****',
      },
    }));

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

  it('Should respond with a InternalServerError when request rejects', async () => {
    Twilio.mockRequestRejectedValue(new Error('Something failed on the process.'));

    const callback = await fn({
      type: 'response', forceFail: false, to: '+55*****1*****', from: '+55*****2*****',
    });

    expect(callback).toBeInstanceOf(InternalServerError);
    expect(callback.body).toBe('[ InternalServerError ]: Something failed on the process.');
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
