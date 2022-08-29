const { Response } = require('../responses/default.response');

class NotFoundError extends Response {
  constructor(body = 'The content you are looking for was not found!') {
    super(`[ NotFoundError ]: ${body}`, 404);
  }

  [Symbol.toStringTag] = this.constructor.name;
}

module.exports = { NotFoundError };
