const extract = (property) => async function (el) {
  return el[property];
};

module.exports = { extract };
