/* global Runtime */
/* eslint-disable global-require */
import * as flexTokenValidator from 'twilio-flex-token-validator';
const { validator } = flexTokenValidator
import  _ from 'lodash';

import { InternalServerError }  from './errors/internal-server.error';
import { UnauthorizedError } from './errors/unauthorized.error';
import { Twilio } from 'twilio';
import { ServerlessCallback, TwilioClient } from '@twilio-labs/serverless-runtime-types/types';

export type InjectorFunction<Event, Env extends EnvironmentVars, Providers extends ProvidersList> = (this: {
  request: Record<string, any>;
  cookies: Record<string, any>;
  env: Omit<InjectionContext<Env>, "getTwilioClient">;
  providers: Providers;
}, event: Event) => Promise<any>

export type ProviderFunction<Data = Record<string, any> | any, Env extends EnvironmentVars = any> = (this: {
  client: Twilio;
  env: Omit<InjectionContext<Env>, "getTwilioClient">;
}, event: Data) => Promise<any>

type Event<Data, Req = {}, Cookies = {}> = {
  [prop in keyof Data]: Data[prop];
} & { Token: string;
  request: Req;
  cookies: Cookies; }

type ProvidersList = {
  [key: string]: ProviderFunction
}

type InjectorOptions<Data extends Record< string, any>, Env extends EnvironmentVars> = {
  providers?: ProvidersList,
  validateToken?: boolean
}

type EnvironmentVars<T = any> = {
  [prop in keyof T]: T[prop]
  & { ACCOUNT_SID: string, AUTH_TOKEN: string }
}

type InjectionContext<T extends Record<string, any>> = 
EnvironmentVars<T> & { getTwilioClient: () => Twilio }

export const useInjection = <Data, Env extends EnvironmentVars, Providers extends ProvidersList>(fn: InjectorFunction<Event<Data>, Env, Providers>, params: InjectorOptions<any, Env>) => async function (...args: [InjectionContext<Env>, Event<Data>, ServerlessCallback]) {
  const [context, event, callback] = args;
  const { getTwilioClient, ...env } = context;

  const providers = _.isUndefined(params?.providers)
    || !_.isPlainObject(params?.providers)
    ? {} : params.providers as ProvidersList

  const validateToken = _.isUndefined(params?.validateToken)
    || _.isNull(params?.validateToken)
    ? false : params.validateToken;

  const client = getTwilioClient();

  const providerThat = {
    client,
    env,
  };

  const {
    request, cookies, Token, ...values
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
    if (validateToken && Token) {
      const validation: any = await validator(
        Token, env.ACCOUNT_SID, env.AUTH_TOKEN,
      );

      if (!validation.valid) {
        return callback(null, new UnauthorizedError(validation.message));
      }
    }

    //@ts-ignore
    return callback(null, await fn.apply(that, [values]));
  } catch (err: any) {
    if (typeof err === 'string') {
      return callback(null, new UnauthorizedError(err));
    }

    return callback(null, new InternalServerError(err.message));
  }
};

// export const useImports = (fn, opts) => async function (...args) {
//   const [context, event, callback] = args;
//   const { getTwilioClient, ...env } = context;

//   const validateToken = _.isUndefined(opts?.validateToken)
//     || _.isNull(opts?.validateToken)
//     ? false : opts.validateToken;

//   const {
//     request, cookies, Token, ...values
//   } = event;

//   const that = {
//     request,
//     cookies,
//     env,
//     twilio: getTwilioClient(),
//   };

//   try {
//     if (validateToken) {
//       const validation = await tokenValidator(
//         Token, env.ACCOUNT_SID, env.AUTH_TOKEN,
//       );

//       if (!validation.valid) {
//         return callback(undefined, new UnauthorizedError(validation.message));
//       }
//     }

//     return callback(undefined, await fn.apply(that, [values]));
//   } catch (err) {
//     if (typeof err === 'string') {
//       return callback(undefined, new UnauthorizedError(err));
//     }

//     return callback(undefined, new InternalServerError(err.message));
//   }
// };

// export const getFromRuntime = (objectThis) => (
//   type, name, path,
// ) => async function (...args) {
//   const file = require(type === 'function'
//     ? Runtime.getFunctions()[path].path
//     : Runtime.getAssets()[`/${path}.js`].path);

//   return file[name].bind({
//     twilio: objectThis.twilio,
//     env: objectThis.env,
//   })(...args);
// };

// export const TWILIO_TYPES = {
//   Functions: 'function',
//   Assets: 'asset',
// };
