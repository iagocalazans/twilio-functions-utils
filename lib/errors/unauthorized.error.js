const { Response } = require('../responses/default.response');

/**
 * This just like the `InternalServerError` is used inside of the `useInjection` mechanics every time you request for Token validation
 *
 * @class
 */
class UnauthorizedError extends Response {
  /**
   *
   * @param {string} body A simple description of what goes wrong
   */
  constructor(body = 'The received request could not be verified!') {
    super(`[ UnauthorizedError ]: ${body}`, 401);
  }

  [Symbol.toStringTag] = this.constructor.name;
}

module.exports = { UnauthorizedError };
