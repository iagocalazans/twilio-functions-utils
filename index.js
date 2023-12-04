const { Try } = require('try2catch');
const {
  CustomWidget,
  Compare,
  Flow,
  SetVariable,
  Split,
} = require('declarative-based-flow');
const { BadRequestError } = require('./lib/errors/bad-request.error');
const { InternalServerError } = require('./lib/errors/internal-server.error');
const { NotFoundError } = require('./lib/errors/not-found.error');
const { UnauthorizedError } = require('./lib/errors/unauthorized.error');
const { Response } = require('./lib/responses/default.response');
const { TwiMLResponse } = require('./lib/responses/twiml.response');
const {
  useInjection,
  useImports,
  TWILIO_TYPES,
  getFromRuntime,
} = require('./lib/use.injection');
const { typeOf } = require('./lib/typeof.function');
const {
  transformInstanceTo,
  transformListTo,
  pipe,
  pipeAsync,
} = require('./lib/transformers');
const { extract, factory } = require('./lib/utils.function');
const { useMock, useImportsMock } = require('./lib/use.mock');
const { dispatch } = require('./lib/dispatch.function');

module.exports = {
  useMock,
  useImportsMock,
  useInjection,
  dispatch,
  extract,
  factory,
  pipe,
  pipeAsync,
  transformListTo,
  transformInstanceTo,
  typeOf,
  useImports,
  getFromRuntime,
  Response,
  BadRequestError,
  InternalServerError,
  NotFoundError,
  TwiMLResponse,
  UnauthorizedError,
  Try,
  CustomWidget,
  Compare,
  Flow,
  SetVariable,
  Split,
  TWILIO_TYPES,
};
