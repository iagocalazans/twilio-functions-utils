/* global describe, it, expect */

require('../lib/twilio.mock');

const {
  useInjection,
  BadRequestError,
  InternalServerError,
  Response,
  TwiMLResponse,
  NotFoundError,
} = require('../index');
const { UnauthorizedError } = require('../lib/errors/unauthorized.error');

const responseTypes = {
  twiml: (provided) => new TwiMLResponse(provided.twiml),
  badRequest: () => new BadRequestError(),
  internalServer: () => new InternalServerError(),
  notFound: () => new NotFoundError(),
  response: (provided) => new Response(provided),
  responseAsString: (provided) => new Response(provided.message),
};

function useItToMock(event) {
  const provided = this.providers.useItAsProvider(event);

  if (event.forceFail) {
    throw new Error('Check fail condition!');
  }

  return responseTypes[provided.type](provided);
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

const fn = useInjection(useItToMock, {
  providers: {
    useItAsProvider,
  },
});

const fnWithToken = useInjection(useItToMock, {
  providers: {
    useItAsProvider,
  },
  validateToken: true,
});

const twilioContext = {
  getTwilioClient() {

  },
  DOMAIN_NAME: 'https://localhost:3000',
};
const twilioCallback = function (err, response) {
  if (err) {
    return err;
  }

  return response;
};

function VoiceResponse() {
  this.body = 'Response';

  this.toString = () => this.body;
}
function VoiceXmlTag() {
  this.body = '<?xml version="1.0" encoding="UTF-8"?><Response />';

  this.toString = () => this.body;
}

describe('Function useInjection', () => {
  it('Should respond with an InternalServerError Instance', async () => {
    const callback = await fn(
      twilioContext, { type: 'response', forceFail: true }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(InternalServerError);
    expect(callback.body).toEqual('[ InternalServerError ]: Check fail condition!');
  });
  it('Should respond with a TwiMLResponse Instance', async () => {
    const callback = await fn(
      twilioContext, { type: 'twiml' }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(TwiMLResponse);
    expect(callback.body).toEqual('<?xml version="1.0" encoding="UTF-8"?><Response />');
  });
  it('Should respond with a TwiMLResponse Instance even if receives an Invalid Object', async () => {
    const callback = await fn(
      twilioContext, { type: 'twiml', twiml: {} }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(TwiMLResponse);
    expect(callback.body).toEqual('<?xml version="1.0" encoding="UTF-8"?><Response />');
  });
  it('Should respond with a TwiMLResponse Instance even if receives a valid TwimlResponse Object without the xml tag', async () => {
    const callback = await fn(
      twilioContext, { type: 'twiml', twiml: new VoiceResponse() }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(TwiMLResponse);
    expect(callback.body).toEqual('<?xml version="1.0" encoding="UTF-8"?><Response />');
  });
  it('Should respond with a TwiMLResponse Instance even if receives a valid TwimlResponse Object', async () => {
    const callback = await fn(
      twilioContext, { type: 'twiml', twiml: new VoiceXmlTag() }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(TwiMLResponse);
    expect(callback.body).toEqual('<?xml version="1.0" encoding="UTF-8"?><Response />');
  });
  it('Should respond with a Response Instance', async () => {
    const callback = await fn(
      twilioContext, { type: 'response' }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(Response);
    expect(callback.body).toEqual({ evaluated: true, type: 'response' });
  });
  it('Should respond with a Response as String Instance', async () => {
    const callback = await fn(
      twilioContext, { type: 'responseAsString', message: 'My message!' }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(Response);
    expect(callback.body).toEqual('My message!');
  });
  it('Should respond with a BadRequestError Instance', async () => {
    const callback = await fn(
      twilioContext, { type: 'badRequest' }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(BadRequestError);
    expect(callback.body).toEqual('[ BadRequestError ]: The request sent to the server is invalid or corrupted!');
  });
  it('Should respond with a NotFoundError Instance', async () => {
    const callback = await fn(
      twilioContext, { type: 'notFound' }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(NotFoundError);
    expect(callback.body).toEqual('[ NotFoundError ]: The content you are looking for was not found!');
  });
  it('Should respond with a InternalServerError Instance', async () => {
    const callback = await fn(
      twilioContext, { type: 'internalServer' }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(InternalServerError);
    expect(callback.body).toEqual('[ InternalServerError ]: The server encountered an unexpected condition that prevented it from fulfilling the request!');
  });
  it('Should respond with a UnauthorizedError Instance', async () => {
    const callback = await fnWithToken(
      twilioContext, { type: 'response' }, twilioCallback,
    );

    expect(callback).toBeInstanceOf(UnauthorizedError);
    expect(callback.body).toEqual('[ UnauthorizedError ]: Unauthorized: Token was not provided');
  });
});
