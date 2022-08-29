/* global describe, it, expect */

require('../../lib/twilio.mock');
const { Response } = require('../../index');

describe('Twilio Response', () => {
  it('Should be an Instance of Response', () => {
    const response = new Response();

    expect(response).toBeInstanceOf(Response);
    expect(response.body).toMatchObject({});
  });

  it('Should have body value equal "My awesome response!" and "Content-Type" equal "text/plain"', () => {
    const response = new Response('My awesome response!', 200);

    expect(response.body).toMatch('My awesome response!');
    expect(response.headers['Content-Type']).toMatch('text/plain');
  });

  it('Should have body value equal object and "Content-Type" equal "application/json"', () => {
    const object = { prop: 'type', type: 'changed' };
    const response = new Response(object);

    expect(response.body).toMatchObject(object);
    expect(response.headers['Content-Type']).toMatch('application/json');
  });

  it('Should have statusCode equal 201', () => {
    const response = new Response('My awesome response!', 201);

    expect(response.statusCode).toBe(201);
  });

  it('Should have headers equal definition', () => {
    const originalHeaders = {
      'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'OPTIONS, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'text/plain',
    };
    const response = new Response('My awesome response!', 201);

    expect(response.headers['Access-Control-Allow-Origin']).toMatch(originalHeaders['Access-Control-Allow-Origin']);
    expect(response.headers['Access-Control-Allow-Methods']).toMatch(originalHeaders['Access-Control-Allow-Methods']);
    expect(response.headers['Access-Control-Allow-Headers']).toMatch(originalHeaders['Access-Control-Allow-Headers']);
    expect(response.headers['Content-Type']).toMatch(originalHeaders['Content-Type']);
  });

  it('Should be able to change headers using appendHeader', () => {
    const originalHeaders = {
      'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'OPTIONS, POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Content-Type': 'text/plain',
    };

    const response = new Response('My awesome response!', 201);
    response.appendHeader('Content-Type', 'application/json');
    response.appendHeader('Access-Control-Allow-Methods', 'POST');

    expect(response.headers['Access-Control-Allow-Origin']).toMatch(originalHeaders['Access-Control-Allow-Origin']);
    expect(response.headers['Access-Control-Allow-Methods']).toMatch('POST');
    expect(response.headers['Access-Control-Allow-Headers']).toMatch(originalHeaders['Access-Control-Allow-Headers']);
    expect(response.headers['Content-Type']).toMatch('application/json');
  });
});
