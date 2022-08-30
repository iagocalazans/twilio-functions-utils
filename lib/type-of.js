/**
 * A more precisely type checker than Javascript built-in typeof.
 *
 * @param { * } input The `input` could be of any type that should be checked.
 *
 * @example
 *
 * typeOf(['myName', 'checker']); // "Array"
 * typeOf('myName'); // "String"
 *
 * @returns { string } Returns a string with the `input` type.
 */
const typeOf = function (input) {
  /**
     * @type { string }
     */
  const stringTag = Object.prototype.toString.call(input);
  return stringTag.match(/(?<=\[\D+ )[A-Za-z]+/).shift();
};

module.exports = { typeOf };
