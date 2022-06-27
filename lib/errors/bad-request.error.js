/* global Twilio */

module.exports.BadRequestError = class BadRequestError
  extends Twilio.Response {
  constructor(body = 'The request sent to the server is invalid or corrupted!') {
    super({ statusCode: 400, body: `[ BadRequestError ]: ${body}` });

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*');
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
      this.appendHeader('Content-Type', 'text/plain');
    }
  }
};
