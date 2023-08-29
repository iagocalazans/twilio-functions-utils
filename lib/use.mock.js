/* eslint-disable new-cap */
/* eslint-disable global-require */
/* global Twilio, jest */

const fs = require('fs');

const readdir = require('@folder/readdir');
const path = require('path');
const _ = require('lodash');
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

  const service = (Twilio.sync.v1.services('default'));

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
   * @param {object} [params.twilio]
   */
  const useMock = (fn, params) => async function (...args) {
    const [event] = args;

    const getTwilioClient = () => Twilio;

    const env = _.isUndefined(params?.env)
    || !_.isPlainObject(params?.env)
      ? {} : params.env;

    const twilio = _.isUndefined(params?.twilio)
    || !_.isObject(params?.twilio)
      ? getTwilioClient() : params.twilio;

    const {
      request, cookies, ...values
    } = event;

    const that = {
      request,
      cookies,
      env,
      twilio,
    };

    try {
      return await fn.apply(that, [values]);
    } catch (err) {
      if (typeof err === 'string') {
        return new UnauthorizedError(err);
      }

      return new InternalServerError(err.message);
    }
  };

  module.exports = { useMock };
}
