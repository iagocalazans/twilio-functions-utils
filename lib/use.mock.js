/* global jest */

const readdir = require('@folder/readdir');
const path = require('path');

const functions = readdir.sync('./functions', {
  base: 'functions', basename: true, depth: 6, nodir: true,
});
const assets = readdir.sync('./assets', {
  base: 'assets', basename: true, depth: 6, nodir: true,
});

Object.defineProperty(
  global, 'Runtime', {
    enumerable: true,
    get: () => ({
      getFunctions: jest.fn(() => (functions.reduce((p, c) => {
        p[`${c.replace('.protected.js', '').replace('.private.js', '').replace('.js', '')}`] = {
          path: path.resolve('./functions', c).replace('.js', ''),
        };
        return p;
      }, {}))),
      getSync: jest.fn(),
      getAssets: jest.fn(() => (assets.reduce((p, c) => {
        p[`/${c.replace('.private', '')}`] = {
          path: path.resolve('./assets', c).replace('.js', ''),
        };
        return p;
      }, {}))),
    }),
  },
);

const _ = require('lodash');

/**
 * @type { import('../types/use.injection').useInjection }
 */
exports.useMock = (fn, params) => async function (...args) {
  const [event] = args;
  const getTwilioClient = jest.fn();

  const providers = _.isUndefined(params?.providers)
    || !_.isPlainObject(params?.providers)
    ? {} : params.providers;

  const client = getTwilioClient();

  const providerThat = {
    client,
  };

  const {
    request, cookies, ...values
  } = event;

  const providerNames = Object.keys(providers);

  const that = {
    request,
    cookies,
    providers: providerNames.reduce((p, c) => {
      Reflect.defineProperty(
        p, c, {
          value: providers[c].bind(providerThat),
          enumerable: true,
        },
      );
      return p;
    }, {}),
  };

  try {
    return await fn.apply(that, [values]);
  } catch (err) {
    console.error(err.stack, err.code);
    return err;
  }
};
