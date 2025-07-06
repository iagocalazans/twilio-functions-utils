import * as fs from 'fs';
// @ts-ignore
import * as readdir from '@folder/readdir';
import * as path from 'path';
import * as _ from 'lodash';
import { mockEffect } from './testing/mock-effect';
import { UnauthorizedError } from './errors/unauthorized.error';
import { InternalServerError } from './errors/internal-server.error';

// Import types from original for compatibility
import type { ProviderFunction, InjectorFunction, InjectorThis, EnvironmentVars } from './use.injection';

// Types already declared in use.mock.ts, no need to redeclare

interface MockParams {
  providers?: Record<string, ProviderFunction>;
  env?: Record<string, any>;
  client?: any;
}

interface MockEvent {
  request?: any;
  cookies?: any;
  [key: string]: any;
}

let useMock: any;

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

  const service = (global as any).Twilio?.sync?.services?.('default') || {
    maps: {},
    lists: {},
    syncMaps: {},
    syncLists: {}
  };

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
   * RxJS-powered mock function that maintains exact compatibility with original useMock
   * Now uses reactive streams under the hood for better testing capabilities
   */
  useMock = <
    Data = Record<string, any>,
    Env extends EnvironmentVars = any,
    Providers extends Record<string, ProviderFunction> = any
  >(
    fn: InjectorFunction<Data, Env, Providers>,
    params?: MockParams
  ) =>
    async function (...args: [MockEvent]): Promise<any> {
      const [event] = args;

      const getTwilioClient = () => (global as any).Twilio || {};

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

      // Create the mock context directly like the original useMock (no RxJS needed for mock)
      const providerThat = {
        client,
        env,
      };

      const { request: eventRequest, cookies: eventCookies, ...values } = event;

      const providerNames = Object.keys(providers);

      const that: InjectorThis<Env, Providers> = {
        request: eventRequest || {},
        cookies: eventCookies || {},
        env: env as any,
        providers: providerNames.reduce((p, c) => {
          Reflect.defineProperty(p, c, {
            value: providers[c].bind(providerThat as any),
            enumerable: true,
          });
          return p;
        }, {} as any),
      };

      try {
        // Execute the function directly like the original useMock
        return await fn.apply(that, [values as any]);
      } catch (err: any) {
        if (typeof err === 'string') {
          return new UnauthorizedError(err);
        }

        return new InternalServerError(err.message);
      }
    };

} else {
  // Export empty function when not in test mode
  useMock = () => {
    throw new Error('useMock is only available in test environment');
  };
}

export { useMock };