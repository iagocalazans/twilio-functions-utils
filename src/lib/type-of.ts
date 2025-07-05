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
  const match = stringTag.match(/(?<=\[\D+ )[A-Za-z]+/);
  return match ? match[0] : 'Unknown';
};