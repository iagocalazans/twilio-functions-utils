/* global describe, it, expect, jest */

const VoiceResponse = require('twilio/lib/twiml/VoiceResponse');

const { Twilio } = require('twilio');
const RequestClient = require('twilio/lib/base/RequestClient');

const mockedRequestClientRequest = jest.spyOn(RequestClient.prototype, 'request');

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

if (process.env.NODE_ENV === 'test') {
  Object.defineProperty(
    global, 'Twilio', {
      enumerable: true,
      get: function () {
        this.Response = Response;

        this.mockRequestResolvedValue = (data) => {
          mockedRequestClientRequest.mockResolvedValueOnce(data);
        };

        this.mockRequestImplementation = (fn) => {
          mockedRequestClientRequest.mockImplementationOnce(fn);
        };

        this.mockRequestRejectedValue = (data) => {
          mockedRequestClientRequest.mockRejectedValueOnce(data);
        };

        this.twiml = {
          VoiceResponse,
        };

        return this;
      }.bind(new Twilio(
        'AC****', 'pass****', { accountSid: 'AC****' },
      )),
    },
  );
}

describe('Global Twilio', () => {
  it('is defined', () => {
    expect(Twilio).toBeDefined();
  });
});
