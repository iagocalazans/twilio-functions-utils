/* global Twilio */
/* eslint-disable no-constructor-return */

module.exports.Response = class Response extends Twilio.Response {
  constructor(body = '[ Success ]: Request returned a success response.', statusCode = 200) {
    super({ statusCode, body });

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*');
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
      this.appendHeader('Content-Type', 'text/plain');

      return this;
    }

    this.appendHeader('Access-Control-Allow-Origin', '*');
    this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    this.appendHeader('Content-Type', 'application/json');

    return this;
  }
};
