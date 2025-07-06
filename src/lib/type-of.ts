/**
 * A more precisely type checker than Javascript built-in typeof.
 *
 * @param input The input could be of any type that should be checked.
 *
 * @example
 *
 * typeOf(['myName', 'checker']); // "Array"
 * typeOf('myName'); // "String"
 *
 * @returns Returns a string with the input type.
 */
export const typeOf = function (input: any): string {
  const stringTag: string = Object.prototype.toString.call(input);
  const match = stringTag.match(/(?<=\[object )[^\]]+/);
  const type = match ? match[0].toLowerCase() : 'unknown';
  
  // Handle special function types
  if (type === 'asyncfunction' || type === 'generatorfunction') {
    return 'function';
  }
  
  // Handle Buffer type (Node.js specific)
  if (typeof Buffer !== 'undefined' && input instanceof Buffer) {
    return 'buffer';
  }
  
  // Handle typed arrays that might be detected as just their base type
  if (type === 'uint' && input instanceof Uint8Array) return 'uint8array';
  if (type === 'int' && input instanceof Int8Array) return 'int8array';
  
  return type;
};