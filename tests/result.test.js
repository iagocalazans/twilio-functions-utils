/* globals describe, it, expect */

const { Result } = require('../lib/result');

describe('Class Result', () => {
  const mockData = {
    property: 'Value of property',
  };

  it('Should return a new instance of Result using ok static method', () => {
    const result = Result.ok(mockData);

    expect(result).toBeInstanceOf(Result);
  });

  it('Should return the data value on getter data', () => {
    const result = Result.ok(mockData);

    expect(result.data).toMatchObject(mockData);
  });

  it('Should return the Error value on getter error', () => {
    expect(Result.failed('An error value to test').error).toMatch('An error value to test');
  });

  it('Should return true when Error and false when isnt', () => {
    expect(Result.failed('An error value to test').isError).toBe(true);
    expect(Result.ok('A success value to test').isError).toBe(false);
  });

  it('Should return an Error when trying to get data value on an Error Result type', () => {
    expect(() => Result.failed('An error type instance to test').data).toThrow('This is not a successfull request. Result with error type instead.');
  });

  it('Should return an Error when trying to get an error value on an Success Result type', () => {
    expect(() => Result.ok('A success type instance to test').error).toThrow('This is a successfull request. Result with data type instead.');
  });

  it('Should set as error an Error instance passed as data value by mystake', () => {
    expect(() => Result.ok(new Error('An error type instance to test')).data).toThrow('This is not a successfull request. Result with error type instead.');
  });
});
