// Twilio global types are already declared in default.response.ts

/**
 * The TwiMLResponse is the must return value on your CustomFn when you should return a Twilio TwiML.
 */
export class TwiMLResponse extends (Twilio.Response as any) {
  /**
   * @param body You can pass a string or a VoiceResponse object
   * @param statusCode HTTP status code
   */
  constructor(
    body: string | { toString(): string } = '<?xml version="1.0" encoding="UTF-8"?><Response />',
    statusCode: number = 200
  ) {
    super({ statusCode, body });

    this.appendHeader('Access-Control-Allow-Origin', '*');
    this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    this.appendHeader('Content-Type', 'application/xml');

    if (typeof body !== 'string') {
      const stringBody = body.toString();

      if (!stringBody.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
        this.setBody('<?xml version="1.0" encoding="UTF-8"?><Response />');
        this.setStatusCode(200);
        return this;
      }

      this.setBody(stringBody);
    }

    return this;
  }
}