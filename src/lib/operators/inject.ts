import { Observable, pipe } from 'rxjs';
import { map, pluck } from 'rxjs/operators';
import { EffectContext } from '../effects/types';

/**
 * Extracts the event data from the effect context
 */
export const injectEvent = <Env = {}, Providers = {}>() =>
  pipe(
    map((context: EffectContext<Env, Providers>) => context.event)
  );

/**
 * Extracts the environment variables from the effect context
 */
export const injectEnv = <Env = {}, Providers = {}>() =>
  pipe(
    map((context: EffectContext<Env, Providers>) => context.env)
  );

/**
 * Extracts the Twilio client from the effect context
 */
export const injectClient = <Env = {}, Providers = {}>() =>
  pipe(
    map((context: EffectContext<Env, Providers>) => context.client)
  );

/**
 * Extracts the providers from the effect context
 */
export const injectProviders = <Env = {}, Providers = {}>() =>
  pipe(
    map((context: EffectContext<Env, Providers>) => context.providers)
  );

/**
 * Extracts the request data (headers and cookies) from the effect context
 */
export const injectRequest = <Env = {}, Providers = {}>() =>
  pipe(
    map((context: EffectContext<Env, Providers>) => context.request)
  );

/**
 * Extracts a specific provider by key
 */
export const injectProvider = <Env = {}, Providers = {}, K extends keyof Providers = keyof Providers>(
  key: K
) =>
  pipe(
    map((context: EffectContext<Env, Providers>) => context.providers[key])
  );

/**
 * Extracts multiple values from the context at once
 */
export const inject = <Env = {}, Providers = {}, T = any>(
  selector: (context: EffectContext<Env, Providers>) => T
) =>
  pipe(
    map((context: EffectContext<Env, Providers>) => selector(context))
  );

/**
 * Combines multiple injections into a single object
 */
export const injectMany = <Env = {}, Providers = {}, T extends Record<string, any> = {}>(
  selectors: { [K in keyof T]: (context: EffectContext<Env, Providers>) => T[K] }
) =>
  pipe(
    map((context: EffectContext<Env, Providers>) => {
      const result = {} as T;
      for (const [key, selector] of Object.entries(selectors)) {
        result[key as keyof T] = selector(context);
      }
      return result;
    })
  );