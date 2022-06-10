const tokenValidator = require('twilio-flex-token-validator').validator;

const { InternalServerError } = require('./errors/internal-server.error');
const { UnauthorizedError } = require('./errors/unauthorized.error');

/**
 * @typedef { (event: Record<string, unknown>) => Promise<unknown> } ActionFn
 * @param { Record<string, unknown> } event
 * @returns  { Promise<unknown> }
 */

/**
 * @typedef { (event: Record<string, unknown>) => Promise<unknown> } UseCaseFn
 * @param { Record<string, unknown> } event
 * @returns  { Promise<unknown> }
 */

/**
 * @typedef { Object } InjectionProviders
 * @property { Record<string, UseCaseFn> } providers
 * @property { boolean } validateToken
 */

/**
 * @typedef { ActionFn } ControllerFn
 * @this { { event: Record<string, unknown>, request: Record<string, unknown>, cookies: Record<string, string>, client: import('twilio').Twilio, props: { DOMAIN_NAME: string }, useCase: Record<string, AsyncFunction>} }
 */

/**
 * @param { ControllerFn } fn
 * @param { InjectionProviders } params
 * @returns { void }
 */
exports.useInjection = (fn, params) =>
  /**
   * @param { [ import('@twilio-labs/serverless-runtime-types/types').Context & Record<string, string> , { request: Record<string, unknown>, cookies: Record<string, string> } & Record<string, unknown>, import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback] } args
   * @returns { Promise<void> }
   */
  // eslint-disable-next-line implicit-arrow-linebreak
  async function (...args) {
    const { providers, validateToken } = params;
    const [context, event, callback] = args;
    const { getTwilioClient, ...properties } = context;
    const client = getTwilioClient();

    const useCaseThat = {
      client,
      props: properties,
    };

    const {
      request, cookies, Token, ...values
    } = event;

    const providerNames = Object.keys(providers);

    const that = {
      request,
      cookies,
      client,
      props: properties,
      useCase: providerNames.reduce((p, c) => {
        Reflect.defineProperty(
          p, c, {
            value: providers[c].bind(useCaseThat),
            enumerable: true,
          },
        );
        return p;
      }, {}),
    };

    try {
      if (validateToken) {
        const validation = await tokenValidator(
          Token, context.ACCOUNT_SID, context.AUTH_TOKEN,
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
