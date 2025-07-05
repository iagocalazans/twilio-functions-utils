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
   * RxJS-powered mock function that maintains exact compatibility with original useMock
   * Now uses reactive streams under the hood for better testing capabilities
   */
  const useMock = <
    Data = Record<string, any>,
    Env extends EnvironmentVars = any,
    Providers extends Record<string, ProviderFunction> = any
  >(
    fn: InjectorFunction<Data, Env, Providers>,
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

      // Convert the regular function to an RxJS Effect for testing
      const effect = (context$: any) =>
        context$.pipe(
          (source: any) => 
            source.switchMap((context: any) => {
              const { event, env, providers, request } = context;
              
              // Create the 'this' context exactly like the original useMock
              const injectorThis: InjectorThis<Env, Providers> = {
                request: request?.headers || {},
                cookies: request?.cookies || {},
                env: env as any,
                providers: providers as Providers
              };
              
              // Execute the original function with proper 'this' binding
              try {
                const result = fn.call(injectorThis, event);
                
                // Handle both sync and async results
                if (result instanceof Promise) {
                  return result;
                }
                
                return Promise.resolve(result);
              } catch (error) {
                throw error;
              }
            })
        );

      // Convert providers to RxJS format
      const providersFactory = Object.entries(providers).reduce((acc, [key, providerFn]) => {
        acc[key] = ({ client, env }: { client: any; env: any }) => {
          return (...args: any[]) => {
            const providerThis = { client, env };
            return providerFn.call(providerThis, ...args);
          };
        };
        return acc;
      }, {} as any);

      try {
        // Use the RxJS testing system but maintain original API
        return await mockEffect(effect, {
          event,
          env,
          client,
          providers: providersFactory,
          headers: event.request?.headers || {},
          cookies: event.cookies || {}
        }).toPromise();
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