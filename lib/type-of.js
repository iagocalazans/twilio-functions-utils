/**
 * A more precisely type checker than Javascript built-in typeof.
 *
 * @type { import('../types/use.injection').typeOf }
 */
const typeOf = function (o) {
  /**
     * @type { string }
     */
  const stringTag = Object.prototype.toString.call(o);
  return stringTag.match(/(?<=\[\D+ )[A-Za-z]+/).shift();
};

module.exports = { typeOf };
