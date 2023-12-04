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
 * @typedef { object } Providers
 */

/**
 * @typedef { object } CustomFnThis
 *
 * @property { object } request The request values as headers
 * @property { object } cookies The request cookies
 * @property { object } env All of the ENV vars available through context can be founded here
 * @property { Providers } providers The providers attached on useInjection options will be available here
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
 * @param { Providers } [params.providers] The providers that should be injected into your CustomFn
 * @param { boolean } [params.validateToken] A boolean to request for Token validation from Twilio Flex
 *
 * @example
 *
 * const { useInjection, Response } = require('twilio-functions-utils');
 * const { create } = require(Runtime.getFunctions()['create'].path)
 *
 * async function createAction(event) {
 *  const { cookies, request, env } = this
 *  const providerResult = await this.providers.create(event)
 *
 *  if (providerResult.isError) {
 *    return new BadRequestError(providerResult.error);
 *  }
 *
 *  return new Response(providerResult.data, 201);
 * }
 *
 * exports.handler = useInjection(createAction, {
 *  providers: {
 *    create,
 *  },
 *  validateToken: true
 * });
 *
 * @return { InjectedFn }
 */
const useInjection = (fn, params) => async function (...args) {
  const [context, event, callback] = args;
  const { getTwilioClient, ...env } = context;

  const providers = _.isUndefined(params?.providers)
    || !_.isPlainObject(params?.providers)
    ? {} : params.providers;

  const validateToken = _.isUndefined(params?.validateToken)
    || _.isNull(params?.validateToken)
    ? false : params.validateToken;

  const client = getTwilioClient();

  const providerThat = {
    client,
    env,
  };

  const {
    request, cookies, Token, ...values
  } = event;

  const providerNames = Object.keys(providers);

  const that = {
    request,
    cookies,
    env,
    providers: providerNames.reduce((p, c) => {
      Reflect.defineProperty(
        p, c, {
          value: providers[c].bind(providerThat),
          enumerable: true,
        },
      );
      return p;
    }, {}),
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

const useImports = (fn, opts) => async function (...args) {
  const [context, event, callback] = args;
  const { getTwilioClient, ...env } = context;

  const validateToken = _.isUndefined(opts?.validateToken)
    || _.isNull(opts?.validateToken)
    ? false : opts.validateToken;

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

const getFromRuntime = (objectThis) => (
  type, name, path,
) => async function (...args) {
  const file = require(type === 'function'
    ? Runtime.getFunctions()[path].path
    : Runtime.getAssets()[`/${path}.js`].path);

  return file[name].bind({
    twilio: objectThis.twilio,
    env: objectThis.env,
  })(...args);
};

const TWILIO_TYPES = {
  Functions: 'function',
  Assets: 'asset',
};

module.exports = {
  useInjection, useImports, getFromRuntime, TWILIO_TYPES,
};
