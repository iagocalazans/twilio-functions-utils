/* global describe, it, expect */

require('../lib/twilio.mock');

const { typeOf } = require('../index');

describe('Function typeOf', () => {
  it('Should return Array', () => {
    expect(typeOf(['one', 'two', 'three'])).toEqual('Array');
  });
  it('Should return String', () => {
    expect(typeOf('one')).toEqual('String');
  });
  it('Should return Object', () => {
    expect(typeOf({ one: 'object' })).toEqual('Object');
  });
  it('Should return Null', () => {
    expect(typeOf(null)).toEqual('Null');
  });
  it('Should return Undefined', () => {
    expect(typeOf(undefined)).toEqual('Undefined');
  });
  it('Should return Symbol', () => {
    expect(typeOf(Symbol('s'))).toEqual('Symbol');
  });
  it('Should return Number', () => {
    expect(typeOf(1)).toEqual('Number');
  });
  it('Should return Number', () => {
    expect(typeOf(NaN)).toEqual('Number');
  });
  it('Should return Number', () => {
    expect(typeOf(-1)).toEqual('Number');
  });
  it('Should return String', () => {
    expect(typeOf('-1')).toEqual('String');
  });
  it('Should return Map', () => {
    expect(typeOf(new Map())).toEqual('Map');
  });
  it('Should return Function', () => {
    expect(typeOf(class MyClass {})).toEqual('Function');
  });
  it('Should return Function', () => {
    expect(typeOf(function MyFunction() {})).toEqual('Function'); //eslint-disable-line
  });
});
