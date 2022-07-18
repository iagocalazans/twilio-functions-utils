const { useInjection, typeOf } = require('./lib/use.injection');
const { useMock } = require('./lib/use.mock');
const { BadRequestError } = require('./lib/errors/bad-request.error');
const { InternalServerError } = require('./lib/errors/internal-server.error');
const { NotFoundError } = require('./lib/errors/not-found.error');
const { Response } = require('./lib/responses/default.response');
const { TwiMLResponse } = require('./lib/responses/twiml.response');

module.exports = {
  useMock,
  useInjection,
  Response,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  TwiMLResponse,
  typeOf,
};
