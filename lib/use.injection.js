const tokenValidator = require('twilio-flex-token-validator').validator;
const _ = require('lodash');

const { InternalServerError } = require('./errors/internal-server.error');
const { UnauthorizedError } = require('./errors/unauthorized.error');

/**
 * @type { import('../types/use.injection').useInjection }
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

    console.error(err.stack, err.code);
    return callback(undefined, new InternalServerError(err.message));
  }
};

/**
 * A more precisely type checker than Javascript built-in typeof.
 *
 * @type { import('../types/use.injection').typeOf }
 */
const typeOf = function (o) {
  /**
   * @type { string }
   */
  const stringTag = Object.prototype.toString.call(o);
  return stringTag.match(/(?<=\[\D+ )[A-Za-z]+/).shift();
};

module.exports = {
  useInjection,
  typeOf,
};
