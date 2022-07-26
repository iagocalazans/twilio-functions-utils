/* eslint-disable no-param-reassign */

/* global jest */
const fs = require('fs');

const readdir = require('@folder/readdir');
const path = require('path');
const _ = require('lodash');

if (process.env.NODE_ENV === 'test') {
  const functionsPath = fs.existsSync(path.join(
    '.', 'src', 'functions',
  )) ? './src/functions' : './functions';

  const assetsPath = fs.existsSync(path.join(
    '.', 'src', 'assets',
  )) ? './src/assets' : './assets';

  const functions = readdir.sync(functionsPath, {
    base: functionsPath,
    recursive: true,
    nodir: true,
  });

  const assets = readdir.sync(assetsPath, {
    base: assetsPath,
    recursive: true,
    nodir: true,
  });

  const SyncMapItemsCaller = function (sid) {
    function SyncMapItems(itemSid) {
      this.fetch = jest.fn(async () => ({
        update: jest.fn((data) => ({
          ...data,
          sid: itemSid,
        })),
      }));
      return this;
    }

    Object.defineProperty(
      SyncMapItems, 'create', {
      value: async (data) => { //eslint-disable-line
          return jest.fn();
        },
      },
    );

    this.sid = sid;
    this.syncMapItems = SyncMapItems;
  };

  Object.defineProperty(
    global, 'Runtime', {
      enumerable: true,
      get: () => ({
        getFunctions: jest.fn(() => (functions.reduce((p, c) => {
          p[`${c.replace(/\.protected\.js|\.protected\.ts/, '').replace(/\.private\.js|\.private\.ts/, '').replace(/\.js|\.ts/, '')}`] = {
            path: path.resolve(functionsPath, c).replace(/\.js|\.ts/, ''),
          };
          return p;
        }, {}))),
        getSync: (service) => ({
          maps: (sid) => new SyncMapItemsCaller(sid),
        }),
        getAssets: jest.fn(() => (assets.reduce((p, c) => {
          p[`/${c.replace(/\.private|\.private/, '')}`] = {
            path: path.resolve(assetsPath, c).replace(/\.js|\.ts/, ''),
          };
          return p;
        }, {}))),
      }),
    },
  );

  /**
   * @type { import('../types/use.injection').useInjection }
   */
  const useMock = (fn, params) => async function (...args) {
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

  module.exports = { useMock };
}
