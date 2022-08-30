const { Response } = require('../responses/default.response');

/**
 * Making your life easier providing a Error like response for NotFound actions
 *
 * @class
 */
class NotFoundError extends Response {
  /**
   *
   * @param {string} body Describe what hasnt founded here
   */
  constructor(body = 'The content you are looking for was not found!') {
    super(`[ NotFoundError ]: ${body}`, 404);
  }

  [Symbol.toStringTag] = this.constructor.name;
}

module.exports = { NotFoundError };
