/* global Twilio */

module.exports.InternalServerError = class InternalServerError
  extends Twilio.Response {
  constructor(body = 'The server encountered an unexpected condition that prevented it from fulfilling the request!') {
    super({ statusCode: 500, body: `[ InternalServerError ]: ${body}` });

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*');
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
      this.appendHeader('Content-Type', 'text/plain');
    }
  }

  [Symbol.toStringTag] = this.constructor.name;
};
