/* global Twilio */

module.exports.NotFoundError = class NotFoundError
  extends Twilio.Response {
  constructor(body = 'The content you are looking for was not found!') {
    super({ statusCode: 404, body: `[ NotFoundError ]: ${body}` });

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*');
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
      this.appendHeader('Content-Type', 'text/plain');
    }
  }
};
