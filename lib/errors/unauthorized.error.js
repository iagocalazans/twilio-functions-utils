const { Response } = require('../responses/default.response');

class UnauthorizedError extends Response {
  constructor(body = 'The received request could not be verified!') {
    super(`[ UnauthorizedError ]: ${body}`, 401);
  }

  [Symbol.toStringTag] = this.constructor.name;
}

module.exports = { UnauthorizedError };
