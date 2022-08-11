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
    let mockedValue = {};
    function SyncMapItems(itemSid) {
      this.fetch = jest.fn(async () => ({
        update: jest.fn((data) => ({
          ...data,
          sid: itemSid,
        })),
        data: { ...mockedValue },
      }));

      this.create = (data) => {
        if (_.isUndefined(data.key)) {
          throw new Error('Error while creating Sync, key cant be undefined!');
        }

        return data;
      };
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

    this.setMapItemFetchResolvedValue = (data) => {
      mockedValue = data;
    };

    this.setSid = (newSid) => {
      this.sid = newSid;
      return this;
    };

    return this;
  };

  Object.defineProperty(
    SyncMapItemsCaller, 'create', {
      value: async (data) => {
        if (_.isUndefined(data.uniqueName)) {
          throw new Error('Error while creating Sync, uniqueName cant be undefined!');
        }

        return data;
      },
    },
  );

  const syncMapItemCreator = SyncMapItemsCaller;

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
        getSync: (_service) => ({
          maps: syncMapItemCreator,
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
   * @param {function} fn
   * @param {object} [params]
   * @param {object} [params.providers]
   * @param {object} [params.env]
   * @param {object} [params.client]
   */
  const useMock = (fn, params) => async function (...args) {
    const [event] = args;
    const getTwilioClient = jest.fn();

    const providers = _.isUndefined(params?.providers)
      || !_.isPlainObject(params?.providers)
      ? {} : params.providers;

    const env = _.isUndefined(params?.env)
      || !_.isPlainObject(params?.env)
      ? {} : params.env;

    const client = _.isUndefined(params?.client)
    || !_.isObject(params?.client)
      ? getTwilioClient() : params.client;

    const providerThat = {
      client,
      env,
    };

    const {
      request, cookies, ...values
    } = event;

    const providerNames = Object.keys(providers);

    const that = {
      request,
      cookies,
      env,
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
