const { useInjection, useTwilioImport, TWILIO_TYPES } = require('./lib/use.injection');
const { typeOf } = require('./lib/typeof.function');
const {
  transformInstanceTo, transformListTo, pipe, pipeAsync,
} = require('./lib/transformers');
const { extract, factory } = require('./lib/utils.function');
const { useMock } = require('./lib/use.mock');
const { BadRequestError } = require('./lib/errors/bad-request.error');
const { InternalServerError } = require('./lib/errors/internal-server.error');
const { NotFoundError } = require('./lib/errors/not-found.error');
const { UnauthorizedError } = require('./lib/errors/unauthorized.error');
const { Response } = require('./lib/responses/default.response');
const { TwiMLResponse } = require('./lib/responses/twiml.response');
const { dispatch } = require('./lib/dispatch.function');

module.exports = {
  dispatch,
  extract,
  factory,
  pipe,
  pipeAsync,
  transformListTo,
  transformInstanceTo,
  typeOf,
  useMock,
  useInjection,
  useTwilioImport,
  BadRequestError,
  NotFoundError,
  InternalServerError,
  Response,
  TwiMLResponse,
  UnauthorizedError,
  TWILIO_TYPES,
};
