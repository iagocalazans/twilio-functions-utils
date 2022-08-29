const { Response } = require('../responses/default.response');

class BadRequestError extends Response {
  constructor(body = 'The request sent to the server is invalid or corrupted!') {
    super(`[ BadRequestError ]: ${body}`, 400);
  }

  [Symbol.toStringTag] = this.constructor.name;
}

module.exports = { BadRequestError };
