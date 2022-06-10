const { InternalServerError } = require('./errors/internal-server.error');

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
 * @property { Array<UseCaseFn> } providers
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
   * @param { [ import('@twilio-labs/serverless-runtime-types/types').Context & Record<string, string> , {request: Record<string, unknown>, cookies: Record<string, string>} & Record<string, unknown>, import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback] } args
   * @returns { Promise<void> }
   */
  // eslint-disable-next-line implicit-arrow-linebreak
  async function (...args) {
    const { providers } = params;
    const [context, event, callback] = args;
    const { getTwilioClient, ...properties } = context;

    const useCaseThat = {
      client: getTwilioClient,
      props: properties,
    };

    const { request, cookies, ...values } = event;

    const that = {
      event,
      request,
      cookies,
      client: getTwilioClient(),
      props: properties,
      useCase: providers.reduce((p, c) => {
        Reflect.defineProperty(
          p, c.name, {
            value: c.bind(useCaseThat),
            enumerable: true,
          },
        );
        return p;
      }, {}),
    };

    try {
      return callback(undefined, await fn.apply(that, [values]));
    } catch (err) {
      return callback(undefined, new InternalServerError(err.message));
    }
  };
