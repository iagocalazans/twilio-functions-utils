function typeOf(input) {
  const stringTag = Object.prototype.toString.call(input);
  return stringTag.match(/(?<=\[\D+ )[A-Za-z]+/)?.shift() ?? 'Unknown';
}

module.exports = { typeOf };
