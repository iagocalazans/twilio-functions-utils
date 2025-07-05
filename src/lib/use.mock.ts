import * as fs from 'fs';
// @ts-ignore
import * as readdir from '@folder/readdir';
import * as path from 'path';
import * as _ from 'lodash';
import { UnauthorizedError } from './errors/unauthorized.error';
import { InternalServerError } from './errors/internal-server.error';

declare global {
  namespace Twilio {
    const sync: {
      services: (name: string) => {
        maps: any;
        lists: any;
        syncMaps: any;
        syncLists: any;
      };
    };
  }

  var jestMock: {
    fn: (implementation?: (...args: any[]) => any) => any;
  };

  const Runtime: {
    getFunctions: () => Record<string, { path: string }>;
    getSync: (service?: string) => any;
    getAssets: () => Record<string, { path: string }>;
  };
}

interface MockParams {
  providers?: Record<string, (...args: any[]) => any>;
  env?: Record<string, any>;
  client?: any;
}

interface MockEvent {
  request?: any;
  cookies?: any;
  [key: string]: any;
}

if (process.env.NODE_ENV === 'test') {
  const functionsPath = fs.existsSync(path.join('.', 'src', 'functions'))
    ? './src/functions'
    : './functions';

  const assetsPath = fs.existsSync(path.join('.', 'src', 'assets'))
    ? './src/assets'
    : './assets';

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

  const service = Twilio.sync.services('default');

  service.maps = service.syncMaps;
  service.lists = service.syncLists;

  Object.defineProperty(global, 'Runtime', {
    enumerable: true,
    get: () => ({
      getFunctions: (() => 
        functions.reduce((p: any, c: any) => {
          p[
            `${c
              .replace(/\.protected\.js|\.protected\.ts/, '')
              .replace(/\.private\.js|\.private\.ts/, '')
              .replace(/\.js|\.ts/, '')}`
          ] = {
            path: path.resolve(functionsPath, c).replace(/\.js|\.ts/, ''),
          };
          return p;
        }, {} as Record<string, { path: string }>)
      ),
      getSync: (_service: string) => service,
      getAssets: (() =>
        assets.reduce((p: any, c: any) => {
          p[`/${c.replace(/\.private|\.private/, '')}`] = {
            path: path.resolve(assetsPath, c).replace(/\.js|\.ts/, ''),
          };
          return p;
        }, {} as Record<string, { path: string }>)
      ),
    }),
  });

  /**
   * Mock function for testing Twilio Functions
   */
  const useMock = (
    fn: (this: any, event: any) => Promise<any>,
    params?: MockParams
  ) =>
    async function (...args: [MockEvent]): Promise<any> {
      const [event] = args;

      const getTwilioClient = () => Twilio;

      const providers =
        _.isUndefined(params?.providers) || !_.isPlainObject(params?.providers)
          ? {}
          : params.providers;

      const env =
        _.isUndefined(params?.env) || !_.isPlainObject(params?.env) ? {} : params.env;

      const client =
        _.isUndefined(params?.client) || !_.isObject(params?.client)
          ? getTwilioClient()
          : params.client;

      const providerThat = {
        client,
        env,
      };

      const { request, cookies, ...values } = event;

      const providerNames = Object.keys(providers);

      const that = {
        request,
        cookies,
        env,
        providers: providerNames.reduce((p, c) => {
          Reflect.defineProperty(p, c, {
            value: providers[c].bind(providerThat),
            enumerable: true,
          });
          return p;
        }, {} as any),
      };

      try {
        return await fn.apply(that, [values]);
      } catch (err: any) {
        if (typeof err === 'string') {
          return new UnauthorizedError(err);
        }

        return new InternalServerError(err.message);
      }
    };

  module.exports = { useMock };
} else {
  // Export empty object when not in test mode
  module.exports = {};
}