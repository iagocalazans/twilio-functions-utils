const { useInjection } = require('./lib/use.injection');
const { typeOf } = require('./lib/typeof.function');
const { remap } = require('./lib/remap.function');
const { extract } = require('./lib/extract.function');
const { get } = require('./lib/get.function');
const { useMock } = require('./lib/use.mock');
const { BadRequestError } = require('./lib/errors/bad-request.error');
const { InternalServerError } = require('./lib/errors/internal-server.error');
const { NotFoundError } = require('./lib/errors/not-found.error');
const { UnauthorizedError } = require('./lib/errors/unauthorized.error');
const { Response } = require('./lib/responses/default.response');
const { TwiMLResponse } = require('./lib/responses/twiml.response');

module.exports = {
  typeOf,
  useMock,
  useInjection,
  Response,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  TwiMLResponse,
  UnauthorizedError,
  remap,
  get,
  extract,
};
