const transformListTo = (action, model) => async function (...args) {
  return (await action(...args)).map(model);
};

const transformInstanceTo = (action, model) => async function (...args) {
  return model((await action(...args).fetch()));
};

module.exports = { transformListTo, transformInstanceTo };
