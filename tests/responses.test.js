const { Response, TwiMLResponse } = require('../dist');

describe('Response', () => {
  it('should create response with JSON body and default status', () => {
    const response = new Response({ message: 'Hello' });
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Hello' });
    expect(response.headers['Content-Type']).toBe('application/json');
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('should create response with custom status code', () => {
    const response = new Response({ data: 'test' }, 201);
    
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ data: 'test' });
  });

  it('should handle string body', () => {
    const response = new Response('Plain text response', 200);
    
    expect(response.body).toBe('Plain text response');
    expect(response.headers['Content-Type']).toBe('text/plain');
  });

  it('should handle empty body', () => {
    const response = new Response();
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({});
  });

  it('should strip Twilio internal properties', () => {
    const response = new Response({
      message: 'Success',
      _version: '1.0',
      _solution: 'internal',
      _context: 'test'
    });
    
    expect(response.body).toEqual({ message: 'Success' });
    expect(response.body._version).toBeUndefined();
    expect(response.body._solution).toBeUndefined();
    expect(response.body._context).toBeUndefined();
  });

  it('should set CORS headers', () => {
    const response = new Response({});
    
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(response.headers['Access-Control-Allow-Methods']).toBe('OPTIONS, POST');
    expect(response.headers['Access-Control-Allow-Headers']).toBe('Content-Type');
  });

  it('should handle nested objects', () => {
    const response = new Response({
      user: {
        id: 123,
        name: 'John',
        metadata: {
          created: '2023-01-01'
        }
      }
    });
    
    expect(response.body).toEqual({
      user: {
        id: 123,
        name: 'John',
        metadata: {
          created: '2023-01-01'
        }
      }
    });
  });

  it('should handle arrays', () => {
    const response = new Response([1, 2, 3, 4, 5]);
    
    expect(response.body).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('TwiMLResponse', () => {
  it('should create TwiML response with Say verb', () => {
    const response = new TwiMLResponse();
    response.say('Hello, World!');
    
    expect(response.statusCode).toBe(200);
    expect(response.headers['Content-Type']).toBe('application/xml');
    expect(response.body).toContain('<Response>');
    expect(response.body).toContain('<Say>Hello, World!</Say>');
  });

  it('should handle multiple TwiML verbs', () => {
    const response = new TwiMLResponse();
    response.say('Welcome');
    response.pause({ length: 2 });
    response.say('Goodbye');
    
    expect(response.body).toContain('<Say>Welcome</Say>');
    expect(response.body).toContain('<Pause length="2"/>');
    expect(response.body).toContain('<Say>Goodbye</Say>');
  });

  it('should handle Say with attributes', () => {
    const response = new TwiMLResponse();
    response.say('Hello', { voice: 'alice', language: 'en-US' });
    
    expect(response.body).toContain('voice="alice"');
    expect(response.body).toContain('language="en-US"');
  });

  it('should handle Dial verb', () => {
    const response = new TwiMLResponse();
    const dial = response.dial({ callerId: '+1234567890' });
    dial.number('+0987654321');
    
    expect(response.body).toContain('<Dial callerId="+1234567890">');
    expect(response.body).toContain('<Number>+0987654321</Number>');
  });

  it('should handle Gather verb', () => {
    const response = new TwiMLResponse();
    const gather = response.gather({
      input: 'dtmf',
      timeout: 5,
      numDigits: 1
    });
    gather.say('Press 1 for sales, 2 for support');
    
    expect(response.body).toContain('<Gather input="dtmf" timeout="5" numDigits="1">');
    expect(response.body).toContain('<Say>Press 1 for sales, 2 for support</Say>');
  });

  it('should handle Play verb', () => {
    const response = new TwiMLResponse();
    response.play('https://example.com/audio.mp3', { loop: 2 });
    
    expect(response.body).toContain('<Play loop="2">https://example.com/audio.mp3</Play>');
  });

  it('should handle Record verb', () => {
    const response = new TwiMLResponse();
    response.record({
      maxLength: 30,
      transcribe: true,
      transcribeCallback: '/transcribe'
    });
    
    expect(response.body).toContain('<Record');
    expect(response.body).toContain('maxLength="30"');
    expect(response.body).toContain('transcribe="true"');
    expect(response.body).toContain('transcribeCallback="/transcribe"');
  });

  it('should handle SMS messaging', () => {
    const response = new TwiMLResponse();
    response.message('Thank you for your message!', {
      to: '+1234567890',
      from: '+0987654321'
    });
    
    expect(response.body).toContain('<Message to="+1234567890" from="+0987654321">');
    expect(response.body).toContain('Thank you for your message!');
  });

  it('should handle Redirect verb', () => {
    const response = new TwiMLResponse();
    response.redirect('/new-handler', { method: 'POST' });
    
    expect(response.body).toContain('<Redirect method="POST">/new-handler</Redirect>');
  });

  it('should handle Reject verb', () => {
    const response = new TwiMLResponse();
    response.reject({ reason: 'busy' });
    
    expect(response.body).toContain('<Reject reason="busy"/>');
  });

  it('should handle complex nested TwiML', () => {
    const response = new TwiMLResponse();
    response.say('Welcome to our phone system');
    
    const gather = response.gather({
      action: '/handle-keypress',
      numDigits: 1
    });
    gather.say('Press 1 for English');
    gather.say('Press 2 for Spanish');
    
    response.say('We did not receive your selection');
    response.redirect('/main-menu');
    
    expect(response.body).toContain('<Say>Welcome to our phone system</Say>');
    expect(response.body).toContain('<Gather action="/handle-keypress" numDigits="1">');
    expect(response.body).toContain('<Say>We did not receive your selection</Say>');
  });

  it('should set proper headers for TwiML', () => {
    const response = new TwiMLResponse();
    response.say('Test');
    
    expect(response.headers['Content-Type']).toBe('application/xml');
    expect(response.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(response.headers['Access-Control-Allow-Methods']).toBe('OPTIONS, POST');
  });
});