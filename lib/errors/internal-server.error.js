const { Response } = require('../responses/default.response');

/**
 * This is the default error like class, it is automatic returned every time the `useInjection` top level try/catch catches something.
 *
 * @class
 */
class InternalServerError extends Response {
  /**
   *
   * @param { string } body A human readable description of what happened
   */
  constructor(body = 'The server encountered an unexpected condition that prevented it from fulfilling the request!') {
    super(`[ InternalServerError ]: ${body}`, 500);
  }

  [Symbol.toStringTag] = this.constructor.name;
}

module.exports = { InternalServerError };
