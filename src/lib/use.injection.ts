/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable global-require */
import * as flexTokenValidator from 'twilio-flex-token-validator'
import _ from 'lodash'

import { InternalServerError } from './errors/internal-server.error'
import { UnauthorizedError } from './errors/unauthorized.error'
import { type Twilio } from 'twilio'
import { type ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types'
const { validator } = flexTokenValidator

export interface InjectorThis<Env extends EnvironmentVars, Providers> {
  request: Record<string, any>
  cookies: Record<string, any>
  env: Omit<InjectionContext<Env>, 'getTwilioClient'>
  providers: Providers
}

export type InjectorFunction<Event, Env extends EnvironmentVars = Record<string, any>, Providers extends ProvidersList = any> = (this: InjectorThis<Env, Providers>, event: Event) => Promise<any>

export type ProviderFunction<Data extends unknown[] = any, Env extends EnvironmentVars = any> = (this: {
  client: Twilio
  env: Omit<InjectionContext<Env>, 'getTwilioClient'>
}, ...event: Data) => any | Promise<any>

type Event<Data, Req = Record<string, any>, Cookies = Record<string, any>> = {
  [prop in keyof Data]: Data[prop];
} & { Token?: string
  request?: Req
  cookies?: Cookies }

type ProvidersList = Record<string, ProviderFunction>

interface InjectorOptions {
  providers?: ProvidersList
  validateToken?: boolean
}

export type EnvironmentVars<T = any> = {
  [prop in keyof T]: T[prop]
  & { ACCOUNT_SID: string, AUTH_TOKEN: string }
}

export type InjectionContext<T extends Record<string, any>> =
EnvironmentVars<T> & { getTwilioClient: () => Twilio }

/**
 * The useInjection method takes two parameters. The first to apply as a
 * handler and the last is an object of configuration options.
 *
 * @param fn Must be writen in standard format, this will be your handler function.
 * @param params [useInjection] Options.providers Object
An object that can contain providers that will be defined, which act as use cases to perform internal actions in the handler function through the this.providers method.

[useInjection] Options.validateToken Boolean
You can pass validateToken equal true to force Flex Token validation using Twilio Flex Token Validator
 * @returns void
 * @example
 *
 * async function createAction(event) {
 *   const { cookies, request, env } = this
 *   const createTry = await this.providers.create(event)
 *
 *   if (createTry.isError) {
 *     return new BadRequestError(createTry.error);
 *   }
 *
 *   return new Response(createTry.data, 201);
 * }
 *
 * exports.handler = useInjection(createAction, {
 *    providers: {
 *      create,
 *    },
 *  validateToken: true, // When using Token Validator, the Request body must contain a valid Token from Twilio.
 * });
 */
export const useInjection = <Data = Record<string, any>, Env extends EnvironmentVars = Record<string, any>, Providers extends ProvidersList = any>(fn: InjectorFunction<Event<Data>, Env, Providers>, params: InjectorOptions) => async function (...args: [InjectionContext<Env>, Event<Data>, ServerlessCallback]): Promise<ReturnType<InjectorFunction<Event<Data>, Env, Providers>>> {
  const [context, event, callback] = args
  const { getTwilioClient, ...env } = context

  const providers = _.isUndefined(params?.providers) ||
    !_.isPlainObject(params?.providers)
    ? {}
    : params.providers

  const validateToken = _.isUndefined(params?.validateToken) ||
    _.isNull(params?.validateToken)
    ? false
    : params.validateToken

  const client = getTwilioClient()

  const providerThat = {
    client,
    env
  }

  const {
    request, cookies, Token, ...values
  } = event

  const providerNames = Object.keys(providers)

  const that = {
    request,
    cookies,
    env,
    providers: providerNames.reduce((p, c) => {
      Reflect.defineProperty(
        p, c, {
          value: providers[c].bind(providerThat),
          enumerable: true
        }
      )
      return p
    }, {})
  }

  try {
    if (validateToken) {
      if (!Token) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw String('Unauthorized: Token was not provided')
      }

      const validation: any = await validator(
        Token, env.ACCOUNT_SID, env.AUTH_TOKEN
      )

      if (!validation.valid) {
        return callback(null, new UnauthorizedError(validation.message));      }
    }

    // @ts-expect-error
    return callback(null, await fn.apply(that, [values]))
  } catch (err: any) {
    if (typeof err === 'string') {
      return callback(null, new UnauthorizedError(err));    }

    return callback(null, new InternalServerError(err.message))
  }
}
