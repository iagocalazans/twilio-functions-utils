/* global Twilio */

module.exports.UnauthorizedError = class UnauthorizedError
  extends Twilio.Response {
  constructor(body = 'The received request could not be verified!') {
    super({ statusCode: 401, body: `[ UnauthorizedError ]: ${body}` });

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*');
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
      this.appendHeader('Content-Type', 'text/plain');
    }
  }

  [Symbol.toStringTag] = this.constructor.name;
};
