/* eslint-disable no-return-assign */
const transformListTo = (action, model) => async function (...args) {
  return (await action(...args)).map(model);
};

const transformInstanceTo = (action, model) => async function (...args) {
  return model((await action(...args).fetch()));
};

const pipe = (...fns) => fns.reduce((result,
  fn) => (...args) => fn(result(...args)));

const retryAsync = (maxCount = 1) => async function recurrency(
  args, cb, count = 1,
) {
  try {
    return await cb(args);
  } catch (err) {
    if (count >= maxCount) {
      throw err;
    }

    return recurrency(
      args, cb, count + 1,
    );
  }
};

const pipeAsync = (...fns) => fns.reduce((result,
  fn) => async (...args) => fn(await result(...args)));

module.exports = {
  transformListTo, transformInstanceTo, pipe, pipeAsync, retryAsync,
};
