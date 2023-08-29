/* global Runtime */
/* eslint-disable global-require */
const tokenValidator = require('twilio-flex-token-validator').validator;
const _ = require('lodash');

const { InternalServerError } = require('./errors/internal-server.error');
const { UnauthorizedError } = require('./errors/unauthorized.error');

/**
 * @async
 * @typedef { function } InjectedFn
 *
 * @param { object } context Handler context
 * @param { object } event Handler event
 * @param { function } callback Handler callback function
 *
 * @return { void }
 */

/**
 * An object with the declared functions to be injected into your custom regular function.
 *
 * @typedef { object } TwilioClient
 */

/**
 * @typedef { object } CustomFnThis
 *
 * @property { object } request The request values as headers
 * @property { object } cookies The request cookies
 * @property { object } env All of the ENV vars available through context can be founded here
 * @property { TwilioClient } twilio The Global Twilio Client on useInjection will be available here
 */

/**
 * Your regular function that will receive all of the providers and process the Twilio handler function.
 *
 * @async
 * @typedef { function } CustomFn
 *
 * @this CustomFnThis
 *
 * @param { * } event Any aditional argument sent to the Twilio handler will be available here.
 *
 * @return { (Response|TwiMLResponse) }
 */

/**
 * The useInjection method takes two parameters. The first to apply as a handler and the last is an object of configuration options.
 * It reduces the need to apply frequent try-catches and improving context management, making it no longer necessary to return the callback() method in all functions.
 *
 * @function
 *
 * @param { CustomFn } fn Your custom function must be defined here as the first `useInjection` parameter
 * @param { object } [params] The `useInjection` additional options as object
 * @param { boolean } [params.validateToken] A boolean to request for Token validation from Twilio Flex
 *
 * @example
 *
 * const { useInjection, Response } = require('twilio-functions-utils');
 *
 * async function createAction(event) {
 *  const { cookies, request, env, twilio } = this
 *  const record = await twilio.recordings(event).fetch()
 *  return new Response(record, 201);
 * }
 *
 * exports.handler = useInjection(createAction, {
 *  validateToken: true
 * });
 *
 * @return { InjectedFn }
 */
const useInjection = (fn, params) => async function (...args) {
  const [context, event, callback] = args;
  const { getTwilioClient, ...env } = context;

  const validateToken = _.isUndefined(params?.validateToken)
    || _.isNull(params?.validateToken)
    ? false : params.validateToken;

  const {
    request, cookies, Token, ...values
  } = event;

  const that = {
    request,
    cookies,
    env,
    twilio: getTwilioClient(),
  };

  try {
    if (validateToken) {
      const validation = await tokenValidator(
        Token, env.ACCOUNT_SID, env.AUTH_TOKEN,
      );

      if (!validation.valid) {
        return callback(undefined, new UnauthorizedError(validation.message));
      }
    }

    return callback(undefined, await fn.apply(that, [values]));
  } catch (err) {
    if (typeof err === 'string') {
      return callback(undefined, new UnauthorizedError(err));
    }

    return callback(undefined, new InternalServerError(err.message));
  }
};

const useTwilio = (objectThis) => (
  type, name, path,
) => async function (...args) {
  const file = require(type === 'function'
    ? Runtime.getFunctions()[path].path
    : Runtime.getAssets()[`/${path}.js`].path);

  return file[name].bind({ twilio: objectThis.twilio })(...args);
};

const TWILIO_TYPES = {
  Functions: 'function',
  Assets: 'asset',
};

module.exports = { useInjection, useTwilio, TWILIO_TYPES };
