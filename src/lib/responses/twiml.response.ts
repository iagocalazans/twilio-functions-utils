// Twilio global types are already declared in default.response.ts

interface TwiMLElement {
  tagName: string;
  attributes: Record<string, string>;
  content?: string;
  children: TwiMLElement[];
}

class TwiMLBuilder {
  private elements: TwiMLElement[] = [];

  say(text: string, attributes: Record<string, any> = {}): this {
    this.elements.push({
      tagName: 'Say',
      attributes: this.formatAttributes(attributes),
      content: text,
      children: []
    });
    return this;
  }

  pause(attributes: Record<string, any> = {}): this {
    this.elements.push({
      tagName: 'Pause',
      attributes: this.formatAttributes(attributes),
      children: []
    });
    return this;
  }

  dial(attributes: Record<string, any> = {}): DialBuilder {
    const dialElement: TwiMLElement = {
      tagName: 'Dial',
      attributes: this.formatAttributes(attributes),
      children: []
    };
    this.elements.push(dialElement);
    return new DialBuilder(dialElement);
  }

  gather(attributes: Record<string, any> = {}): GatherBuilder {
    const gatherElement: TwiMLElement = {
      tagName: 'Gather',
      attributes: this.formatAttributes(attributes),
      children: []
    };
    this.elements.push(gatherElement);
    return new GatherBuilder(gatherElement);
  }

  play(url: string, attributes: Record<string, any> = {}): this {
    this.elements.push({
      tagName: 'Play',
      attributes: this.formatAttributes(attributes),
      content: url,
      children: []
    });
    return this;
  }

  record(attributes: Record<string, any> = {}): this {
    this.elements.push({
      tagName: 'Record',
      attributes: this.formatAttributes(attributes),
      children: []
    });
    return this;
  }

  message(body: string, attributes: Record<string, any> = {}): this {
    this.elements.push({
      tagName: 'Message',
      attributes: this.formatAttributes(attributes),
      content: body,
      children: []
    });
    return this;
  }

  redirect(url: string, attributes: Record<string, any> = {}): this {
    this.elements.push({
      tagName: 'Redirect',
      attributes: this.formatAttributes(attributes),
      content: url,
      children: []
    });
    return this;
  }

  reject(attributes: Record<string, any> = {}): this {
    this.elements.push({
      tagName: 'Reject',
      attributes: this.formatAttributes(attributes),
      children: []
    });
    return this;
  }

  private formatAttributes(attributes: Record<string, any>): Record<string, string> {
    const formatted: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      formatted[key] = String(value);
    }
    return formatted;
  }

  toString(): string {
    return '<?xml version="1.0" encoding="UTF-8"?><Response>' +
      this.elements.map(el => this.elementToString(el)).join('') +
      '</Response>';
  }

  private elementToString(element: TwiMLElement): string {
    const attrs = Object.entries(element.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    const attrString = attrs ? ` ${attrs}` : '';

    if (element.children.length > 0) {
      const childrenString = element.children.map(child => this.elementToString(child)).join('');
      return `<${element.tagName}${attrString}>${childrenString}</${element.tagName}>`;
    } else if (element.content !== undefined) {
      return `<${element.tagName}${attrString}>${element.content}</${element.tagName}>`;
    } else {
      return `<${element.tagName}${attrString}/>`;
    }
  }
}

class DialBuilder {
  constructor(private element: TwiMLElement) {}

  number(phoneNumber: string, attributes: Record<string, any> = {}): this {
    this.element.children.push({
      tagName: 'Number',
      attributes: this.formatAttributes(attributes),
      content: phoneNumber,
      children: []
    });
    return this;
  }

  private formatAttributes(attributes: Record<string, any>): Record<string, string> {
    const formatted: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      formatted[key] = String(value);
    }
    return formatted;
  }
}

class GatherBuilder {
  constructor(private element: TwiMLElement) {}

  say(text: string, attributes: Record<string, any> = {}): this {
    this.element.children.push({
      tagName: 'Say',
      attributes: this.formatAttributes(attributes),
      content: text,
      children: []
    });
    return this;
  }

  play(url: string, attributes: Record<string, any> = {}): this {
    this.element.children.push({
      tagName: 'Play',
      attributes: this.formatAttributes(attributes),
      content: url,
      children: []
    });
    return this;
  }

  pause(attributes: Record<string, any> = {}): this {
    this.element.children.push({
      tagName: 'Pause',
      attributes: this.formatAttributes(attributes),
      children: []
    });
    return this;
  }

  private formatAttributes(attributes: Record<string, any>): Record<string, string> {
    const formatted: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      formatted[key] = String(value);
    }
    return formatted;
  }
}

/**
 * The TwiMLResponse is the must return value on your CustomFn when you should return a Twilio TwiML.
 */
export class TwiMLResponse extends (Twilio.Response as any) {
  private twimlBuilder: TwiMLBuilder;

  /**
   * @param body You can pass a string or a VoiceResponse object
   * @param statusCode HTTP status code
   */
  constructor(
    body?: string | { toString(): string },
    statusCode: number = 200
  ) {
    super({ statusCode });

    this.appendHeader('Access-Control-Allow-Origin', '*');
    this.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    this.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    this.appendHeader('Content-Type', 'application/xml');

    this.twimlBuilder = new TwiMLBuilder();

    if (body) {
      if (typeof body === 'string') {
        this.setBody(body);
      } else {
        this.setBody(body.toString());
      }
    } else {
      this.setBody(this.twimlBuilder.toString());
    }
  }

  say(text: string, attributes: Record<string, any> = {}): this {
    this.twimlBuilder.say(text, attributes);
    this.setBody(this.twimlBuilder.toString());
    return this;
  }

  pause(attributes: Record<string, any> = {}): this {
    this.twimlBuilder.pause(attributes);
    this.setBody(this.twimlBuilder.toString());
    return this;
  }

  dial(attributes: Record<string, any> = {}): DialBuilder {
    const dial = this.twimlBuilder.dial(attributes);
    // Don't set body here - wait for children to be added
    const originalSetBody = this.setBody.bind(this);
    const self = this;
    
    // Override the DialBuilder to update the response body after adding children
    const originalNumber = dial.number.bind(dial);
    dial.number = function(phoneNumber: string, attributes: Record<string, any> = {}) {
      const result = originalNumber(phoneNumber, attributes);
      self.setBody(self.twimlBuilder.toString());
      return result;
    };
    
    this.setBody(this.twimlBuilder.toString());
    return dial;
  }

  gather(attributes: Record<string, any> = {}): GatherBuilder {
    const gather = this.twimlBuilder.gather(attributes);
    // Don't set body here - wait for children to be added
    const self = this;
    
    // Override the GatherBuilder methods to update the response body after adding children
    const originalSay = gather.say.bind(gather);
    gather.say = function(text: string, attributes: Record<string, any> = {}) {
      const result = originalSay(text, attributes);
      self.setBody(self.twimlBuilder.toString());
      return result;
    };
    
    const originalPlay = gather.play.bind(gather);
    gather.play = function(url: string, attributes: Record<string, any> = {}) {
      const result = originalPlay(url, attributes);
      self.setBody(self.twimlBuilder.toString());
      return result;
    };
    
    const originalPause = gather.pause.bind(gather);
    gather.pause = function(attributes: Record<string, any> = {}) {
      const result = originalPause(attributes);
      self.setBody(self.twimlBuilder.toString());
      return result;
    };
    
    this.setBody(this.twimlBuilder.toString());
    return gather;
  }

  play(url: string, attributes: Record<string, any> = {}): this {
    this.twimlBuilder.play(url, attributes);
    this.setBody(this.twimlBuilder.toString());
    return this;
  }

  record(attributes: Record<string, any> = {}): this {
    this.twimlBuilder.record(attributes);
    this.setBody(this.twimlBuilder.toString());
    return this;
  }

  message(body: string, attributes: Record<string, any> = {}): this {
    this.twimlBuilder.message(body, attributes);
    this.setBody(this.twimlBuilder.toString());
    return this;
  }

  redirect(url: string, attributes: Record<string, any> = {}): this {
    this.twimlBuilder.redirect(url, attributes);
    this.setBody(this.twimlBuilder.toString());
    return this;
  }

  reject(attributes: Record<string, any> = {}): this {
    this.twimlBuilder.reject(attributes);
    this.setBody(this.twimlBuilder.toString());
    return this;
  }
}