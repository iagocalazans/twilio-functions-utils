const { typeOf } = require('../dist');

describe('typeOf', () => {
  it('should identify string types', () => {
    expect(typeOf('hello')).toBe('string');
    expect(typeOf('')).toBe('string');
    expect(typeOf(String('test'))).toBe('string');
  });

  it('should identify number types', () => {
    expect(typeOf(42)).toBe('number');
    expect(typeOf(0)).toBe('number');
    expect(typeOf(-123.45)).toBe('number');
    expect(typeOf(NaN)).toBe('number');
    expect(typeOf(Infinity)).toBe('number');
  });

  it('should identify boolean types', () => {
    expect(typeOf(true)).toBe('boolean');
    expect(typeOf(false)).toBe('boolean');
    expect(typeOf(Boolean(1))).toBe('boolean');
  });

  it('should identify null', () => {
    expect(typeOf(null)).toBe('null');
  });

  it('should identify undefined', () => {
    expect(typeOf(undefined)).toBe('undefined');
    expect(typeOf(void 0)).toBe('undefined');
  });

  it('should identify objects', () => {
    expect(typeOf({})).toBe('object');
    expect(typeOf({ a: 1 })).toBe('object');
    expect(typeOf(new Object())).toBe('object');
  });

  it('should identify arrays', () => {
    expect(typeOf([])).toBe('array');
    expect(typeOf([1, 2, 3])).toBe('array');
    expect(typeOf(new Array())).toBe('array');
  });

  it('should identify functions', () => {
    expect(typeOf(function() {})).toBe('function');
    expect(typeOf(() => {})).toBe('function');
    expect(typeOf(async function() {})).toBe('function');
    expect(typeOf(function* () {})).toBe('function');
  });

  it('should identify dates', () => {
    expect(typeOf(new Date())).toBe('date');
    expect(typeOf(new Date('2023-01-01'))).toBe('date');
  });

  it('should identify regular expressions', () => {
    expect(typeOf(/test/)).toBe('regexp');
    expect(typeOf(new RegExp('test'))).toBe('regexp');
    expect(typeOf(/[a-z]+/gi)).toBe('regexp');
  });

  it('should identify errors', () => {
    expect(typeOf(new Error())).toBe('error');
    expect(typeOf(new TypeError())).toBe('error');
    expect(typeOf(new RangeError())).toBe('error');
  });

  it('should identify symbols', () => {
    expect(typeOf(Symbol())).toBe('symbol');
    expect(typeOf(Symbol('test'))).toBe('symbol');
    expect(typeOf(Symbol.iterator)).toBe('symbol');
  });

  it('should identify promises', () => {
    expect(typeOf(Promise.resolve())).toBe('promise');
    expect(typeOf(new Promise(() => {}))).toBe('promise');
    expect(typeOf(Promise.reject().catch(() => {}))).toBe('promise');
  });

  it('should identify maps', () => {
    expect(typeOf(new Map())).toBe('map');
    expect(typeOf(new Map([['key', 'value']]))).toBe('map');
  });

  it('should identify sets', () => {
    expect(typeOf(new Set())).toBe('set');
    expect(typeOf(new Set([1, 2, 3]))).toBe('set');
  });

  it('should identify weakmaps', () => {
    expect(typeOf(new WeakMap())).toBe('weakmap');
  });

  it('should identify weaksets', () => {
    expect(typeOf(new WeakSet())).toBe('weakset');
  });

  it('should identify typed arrays', () => {
    expect(typeOf(new Int8Array())).toBe('int8array');
    expect(typeOf(new Uint8Array())).toBe('uint8array');
    expect(typeOf(new Int16Array())).toBe('int16array');
    expect(typeOf(new Uint16Array())).toBe('uint16array');
    expect(typeOf(new Int32Array())).toBe('int32array');
    expect(typeOf(new Uint32Array())).toBe('uint32array');
    expect(typeOf(new Float32Array())).toBe('float32array');
    expect(typeOf(new Float64Array())).toBe('float64array');
  });

  it('should identify buffers', () => {
    if (typeof Buffer !== 'undefined') {
      expect(typeOf(Buffer.from('test'))).toBe('buffer');
      expect(typeOf(Buffer.alloc(10))).toBe('buffer');
    }
  });

  it('should handle custom objects', () => {
    class CustomClass {}
    const instance = new CustomClass();
    
    // Custom classes are identified as objects
    expect(typeOf(instance)).toBe('object');
  });

  it('should handle edge cases', () => {
    // Object.create(null) creates object without prototype
    expect(typeOf(Object.create(null))).toBe('object');
    
    // Arguments object
    function testArgs() {
      expect(typeOf(arguments)).toBe('arguments');
    }
    testArgs(1, 2, 3);
  });

  it('should be case sensitive', () => {
    const type = typeOf('test');
    expect(type).toBe('string');
    expect(type).not.toBe('String');
    expect(type).not.toBe('STRING');
  });
});