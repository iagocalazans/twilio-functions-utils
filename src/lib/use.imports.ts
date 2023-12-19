/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import * as flexTokenValidator from 'twilio-flex-token-validator'
import { type ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types'
import { type Twilio } from 'twilio'
import _ from 'lodash'
import { InternalServerError } from './errors/internal-server.error'
import { UnauthorizedError } from './errors/unauthorized.error'
const { validator } = flexTokenValidator

export interface ImportThis<Env extends EnvironmentVars> {
  request: Record<string, any>
  cookies: Record<string, any>
  twilio: Twilio
  env: Omit<ImportContext<Env>, 'getTwilioClient'>
}

export type ImportFunction<Event, Env extends EnvironmentVars> = (this: {
  request: Record<string, any>
  cookies: Record<string, any>
  twilio: Twilio
  env: Omit<ImportContext<Env>, 'getTwilioClient'>
}, event: Event) => Promise<any>

  type Event<Data, Req = Record<string, unknown>, Cookies = Record<string, unknown>> = {
    [prop in keyof Data]: Data[prop];
  } & { Token?: string;
    request?: Req;
    cookies?: Cookies; 
}
  
  type ImportOptions = {
    validateToken?: boolean
  }

  type EnvironmentVars<T = any> = {
    [prop in keyof T]: T[prop]
    & { ACCOUNT_SID: string, AUTH_TOKEN: string }
  }

  type ImportContext<T extends Record<string, any>> =
  EnvironmentVars<T> & { getTwilioClient: () => Twilio }

export const useImports = <Data, Env extends EnvironmentVars>(fn: ImportFunction<Event<Data>, Env>, params: ImportOptions) => async function (...args: [ImportContext<Env>, Event<Data>, ServerlessCallback]) {
  const [context, event, callback] = args
  const { getTwilioClient, ...env } = context

  const validateToken = _.isUndefined(params?.validateToken) ||
    _.isNull(params?.validateToken)
    ? false
    : params.validateToken

  const {
    request, cookies, Token, ...values
  } = event

  const that = {
    request,
    cookies,
    env,
    twilio: getTwilioClient()
  }

  try {
    if (validateToken) {
      if (!Token) {
        throw String("Unauthorized: Token was not provided")
      }
  
      const validation: any = await validator(
        Token, env.ACCOUNT_SID, env.AUTH_TOKEN
      )

      if (!validation.valid) {
        callback(null, new UnauthorizedError(validation.message)); return
      }
    }

    // @ts-expect-error
    callback(null, await fn.apply(that, [values]))
  } catch (err: any) {
    if (typeof err === 'string') {
      callback(null, new UnauthorizedError(err)); return
    }

    callback(null, new InternalServerError(err.message))
  }
}

export const getFromRuntime = (ot: ImportThis<EnvironmentVars>) => (
  type: TWILIO_TYPES, name: string, path: string
) => async function (...args: unknown[]) {
  const file = require(type === 'function'
    ? Runtime.getFunctions()[path].path
    : Runtime.getAssets()[`/${path}.js`].path)

  return file[name].bind({
    twilio: ot.twilio,
    env: ot.env
  })(...args)
}

export enum TWILIO_TYPES {
  Functions = 'function',
  Assets = 'asset',
};
