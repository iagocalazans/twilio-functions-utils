/* eslint-disable new-cap */
/* eslint-disable global-require */
/* global Twilio, jest */

const fs = require('fs');

const readdir = require('@folder/readdir');
const path = require('path');
const _ = require('lodash');
const { ServiceList } = require('twilio/lib/rest/sync/v1/service');
const { UnauthorizedError } = require('./errors/unauthorized.error');
const { InternalServerError } = require('./errors/internal-server.error');

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

  const service = (Twilio.sync.services('default'));

  service.maps = service.syncMaps;
  service.lists = service.syncLists;

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
        getSync: (_service) => service,
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

    const getTwilioClient = () => Twilio;

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
      if (typeof err === 'string') {
        return new UnauthorizedError(err);
      }

      return new InternalServerError(err);
    }
  };

  module.exports = { useMock };
}
