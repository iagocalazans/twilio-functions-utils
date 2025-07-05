import * as _ from 'lodash';

declare global {
  namespace Twilio {
    class Response {
      constructor(options: { statusCode?: number; body?: any });
      appendHeader(key: string, value: string): void;
      setBody(body: any): void;
      setStatusCode(statusCode: number): void;
    }
  }
}

interface TwilioResponse {
  appendHeader(key: string, value: string): void;
  setBody(body: any): void;
  setStatusCode(statusCode: number): void;
}

/**
 * The Response is the must return value on your CustomFn.
 */
export class Response extends (Twilio.Response as any) {
  /**
   * @param body The response body, can be string or object
   * @param statusCode HTTP status code
   */
  constructor(body: string | object = {}, statusCode: number = 200) {
    super({ statusCode });

    if (typeof body === 'string') {
      this.appendHeader('Access-Control-Allow-Origin', '*');
      this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
      this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
      this.appendHeader('Content-Type', 'text/plain');
      this.setBody(body);
      return;
    }

    this.appendHeader('Access-Control-Allow-Origin', '*');
    this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    this.appendHeader('Content-Type', 'application/json');

    this.setBody(_.omit(body as any, ['_version', '_solution', '_context']));
  }
}