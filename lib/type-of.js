/**
 * A more precisely type checker than Javascript built-in typeof.
 *
 * @param {*} o
 * @returns {string}
 */
const typeOf = function (o) {
  /**
     * @type { string }
     */
  const stringTag = Object.prototype.toString.call(o);
  return stringTag.match(/(?<=\[\D+ )[A-Za-z]+/).shift();
};

module.exports = { typeOf };
