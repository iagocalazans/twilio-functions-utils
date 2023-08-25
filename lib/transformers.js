const transformListTo = (action, model) => async function (...args) {
  return (await action(...args)).map(model);
};

const transformInstanceTo = (action, model) => async function (...args) {
  return model((await action(...args).fetch()));
};

const pipe = (...fns) => fns.reduce((result,
  fn) => (...args) => fn(result(...args)));

module.exports = { transformListTo, transformInstanceTo, pipe };
