const remap = (action, model) => async function (...args) {
  return (await action(...args)).map(model);
};

module.exports = { remap };
