const transformListTo = (action, model) => async function (...args) {
  return (await action(...args)).map(model);
};

const transformInstanceTo = (action, property) => async function (...args) {
  return (await action(...args).fetch())[property];
};

module.exports = { transformListTo, transformInstanceTo };
