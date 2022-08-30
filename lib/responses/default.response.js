/* global Twilio */

/**
 * @external "Twilio.Response"
 *
 * @see {@link https://www.twilio.com/docs/libraries/reference/twilio-node/3.81.0/Twilio.html| JSDoc: Class: Twilio}
 */

/**
 * The Response is the must return value on your CustomFn.
 *
 * @class
 *
 * @extends { external:"Twilio.Response" }
 */
class Response extends Twilio.Response {
  /**
   *
   * @param {(string|object)} body
   * @param {number} statusCode
   * @returns {Response}
   */
  constructor(body = {}, statusCode = 200) {
    super({ statusCode, body });

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*');
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
      this.appendHeader('Content-Type', 'text/plain');

      return;
    }

    this.appendHeader('Access-Control-Allow-Origin', '*');
    this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    this.appendHeader('Content-Type', 'application/json');
  }
}

module.exports = { Response };
