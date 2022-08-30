const { Response } = require('../responses/default.response');

/**
 * A error like Response class to be returned when something goes wrong.
 *
 * @class
 */
class BadRequestError extends Response {
  /**
   * @param { string } body Your message to describe what happened
   */
  constructor(body = 'The request sent to the server is invalid or corrupted!') {
    super(`[ BadRequestError ]: ${body}`, 400);
  }

  [Symbol.toStringTag] = this.constructor.name;
}

module.exports = { BadRequestError };
