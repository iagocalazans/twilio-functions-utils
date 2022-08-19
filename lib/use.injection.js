const tokenValidator = require('twilio-flex-token-validator').validator;
const _ = require('lodash');

const { InternalServerError } = require('./errors/internal-server.error');
const { UnauthorizedError } = require('./errors/unauthorized.error');

/**
 * The useInjection method takes two parameters. The first to apply as a handler and the last is an object of configuration options.
 * It reduces the need to apply frequent try-catches and improving context management, making it no longer necessary to return the callback() method in all functions.
 *
 * @param {function} fn
 * @param {object} [params]
 * @param {object} [params.providers]
 * @param {boolean} [params.validateToken]
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

    // eslint-disable-next-line no-console
    console.error(err.stack, err.code);
    return callback(undefined, new InternalServerError(err.message));
  }
};

module.exports = { useInjection };
