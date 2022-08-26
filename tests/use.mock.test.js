/* global jest, describe, it, expect, Runtime */

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

  it('Should respond with an InternalServerError Instance', async () => {
    const callback = await fn({ type: 'internalServer', forceFail: true });

    expect(callback).toBeInstanceOf(InternalServerError);
    expect(callback.body).toEqual('[ InternalServerError ]: Error: Check fail condition!');
  });

  it('Should respond with a Response Instance', async () => {
    const callback = await fn({ type: 'response', forceFail: false });

    expect(callback).toBeInstanceOf(Response);
    expect(callback.body).toEqual({ evaluated: true, forceFail: false, type: 'response' });
  });

  it('Should find paths for getFunctions and getAssets', async () => {
    expect(fsCalls).toHaveBeenCalled();

    expect(Runtime.getFunctions()['use-to-test'].path).toBe('/home/iagocalazans/personal/twilio-functions-utils/functions/use-to-test');
    expect(Runtime.getAssets()['/use-to-test.js'].path).toBe('/home/iagocalazans/personal/twilio-functions-utils/assets/use-to-test');
  });

  it('Should throw an error while creating a map without uniqueName', async () => {
    try {
      await Runtime.getSync().maps.create({ data: { notToTeste: 'something' } });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch('Error while creating Sync, uniqueName cant be undefined!');
    }
  });

  it('Should throw an error while creating a syncMapItems without key', async () => {
    try {
      await Runtime.getSync().maps('').syncMapItems.create({ data: { notToTeste: 'something' } });
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch('Error while creating Sync, key cant be undefined!');
    }
  });

  it('Should find paths for getSync', async () => {
    await Runtime.getSync().maps.create({ uniqueName: 'Call-undefined', data: { notToTeste: 'something' } });

    await Runtime.getSync().maps().syncMapItems.create({ key: 'Call-undefined', teste: 'first' });

    await Runtime.getSync().maps().syncMapItems.setMapItemFetchResolvedValue({ teste: 'object' });
    await Runtime.getSync().maps().syncMapItems.setMapItemFetchResolvedValue({ teste: 'objected' });

    const maps = await Runtime.getSync().maps().syncMapItems('').fetch();

    expect(maps.data).toEqual({ teste: 'objected' });

    await maps.update({ teste: 'postUpdate' });

    expect(maps.data).toEqual({ teste: 'postUpdate' });
  });
});
