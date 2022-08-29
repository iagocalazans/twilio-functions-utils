/* global describe, it,  expect, Twilio */

const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');

class Response {
  constructor(data) {
    this.statusCode = data.statusCode;
    this.body = data.body;
    this.headers = data.headers ?? {};
  }

  setStatusCode(code) {
    this.statusCode = code;
  }

  setBody(body) {
    this.body = body;
  }

  appendHeader(key, value) {
    this.headers[key] = value;
  }
}

Object.defineProperty(
  global, 'Twilio', {
    enumerable: true,
    get() {
      this.Response = Response;

      this.twiml = {
        VoiceResponse,
      };

      return this;
    },
  },
);

describe('Global Twilio', () => {
  it('is defined', () => {
    expect(Twilio).toBeDefined();
  });
});
