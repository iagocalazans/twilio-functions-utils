const { Result } = require('../dist');

describe('Result', () => {
  describe('Result.ok', () => {
    it('should create successful result with data', () => {
      const result = Result.ok({ message: 'Success' });
      
      expect(result.isError).toBe(false);
      expect(result.data).toEqual({ message: 'Success' });
    });

    it('should handle null data', () => {
      const result = Result.ok(null);
      
      expect(result.isError).toBe(false);
      expect(result.data).toBeNull();
    });

    it('should handle undefined data', () => {
      const result = Result.ok(undefined);
      
      expect(result.isError).toBe(false);
      expect(result.data).toBeUndefined();
    });

    it('should handle primitive data types', () => {
      const stringResult = Result.ok('Hello');
      const numberResult = Result.ok(42);
      const booleanResult = Result.ok(true);
      
      expect(stringResult.data).toBe('Hello');
      expect(numberResult.data).toBe(42);
      expect(booleanResult.data).toBe(true);
    });

    it('should throw when accessing error on success result', () => {
      const result = Result.ok({ success: true });
      
      expect(() => result.error).toThrow('This is a successful request. Result with data type instead.');
    });
  });

  describe('Result.failed', () => {
    it('should create error result with error data', () => {
      const result = Result.failed({ code: 'ERROR_001', message: 'Something failed' });
      
      expect(result.isError).toBe(true);
      expect(result.error).toEqual({ code: 'ERROR_001', message: 'Something failed' });
    });

    it('should handle string errors', () => {
      const result = Result.failed('Error message');
      
      expect(result.isError).toBe(true);
      expect(result.error).toBe('Error message');
    });

    it('should handle Error objects', () => {
      const error = new Error('Test error');
      const result = Result.failed(error);
      
      expect(result.isError).toBe(true);
      expect(result.error).toBe(error);
    });

    it('should throw when accessing data on error result', () => {
      const result = Result.failed({ error: 'Failed' });
      
      expect(() => result.data).toThrow('This is not a successful request. Result with error type instead.');
    });
  });

  describe('Basic functionality', () => {
    it('should provide access to data in successful results', () => {
      const result = Result.ok({ message: 'Success' });
      
      expect(result.data).toEqual({ message: 'Success' });
    });

    it('should provide access to error in failed results', () => {
      const result = Result.failed({ code: 'ERROR_001' });
      
      expect(result.error).toEqual({ code: 'ERROR_001' });
    });

    it('should handle constructor with Error instance', () => {
      const error = new Error('Test error');
      const result = Result.failed(error);
      
      expect(result.isError).toBe(true);
      expect(result.error).toBe(error);
    });
  });

  describe('Edge cases', () => {
    it('should handle different error types', () => {
      const stringError = Result.failed('String error');
      const numberError = Result.failed(404);
      const objectError = Result.failed({ code: 'NOT_FOUND' });
      
      expect(stringError.error).toBe('String error');
      expect(numberError.error).toBe(404);
      expect(objectError.error).toEqual({ code: 'NOT_FOUND' });
    });

    it('should handle different data types', () => {
      const stringResult = Result.ok('success');
      const arrayResult = Result.ok([1, 2, 3]);
      const objectResult = Result.ok({ id: 1 });
      
      expect(stringResult.data).toBe('success');
      expect(arrayResult.data).toEqual([1, 2, 3]);
      expect(objectResult.data).toEqual({ id: 1 });
    });
  });

  describe('Type checking', () => {
    it('should work with TypeScript-style type guards', () => {
      const result = Result.ok({ value: 42 });
      
      if (!result.isError) {
        // TypeScript would know result.data is accessible here
        expect(result.data.value).toBe(42);
      } else {
        // TypeScript would know result.error is accessible here
        fail('Should not be error');
      }
    });
  });
});