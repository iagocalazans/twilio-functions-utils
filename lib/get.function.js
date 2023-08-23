const get = (action, property) => async function (...args) {
  return (await action(...args).fetch())[property];
};

module.exports = { get };
