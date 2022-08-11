/* global describe, it, jest, expect, Twilio */

const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');

Object.defineProperty(
  global, 'Twilio', {
    enumerable: true,
    get() {
      this.Response = jest.fn().mockImplementation(function (value) {
        this.headers = new Map();
        this.appendHeader = jest.fn((key, v) => {
          this.headers.set(key, v);
        });

        this.body = value?.body;
        this.statusCode = value?.statusCode;

        this.setBody = (body) => {
          this.body = body;
        };
        this.setStatusCode = (status) => {
          this.statusCode = status;
        };
      });

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
