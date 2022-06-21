import { TwilioClient } from '@twilio-labs/serverless-runtime-types/types'

export type Event = {
    [key: string]: any,
    request: Record<string, unknown>,
    cookies: Record<string, string>,
    Token?: string
}

export type Providers = {
    [key: string]: AsyncFunction
}

export type Context = {
    getTwilioClient: () => TwilioClient,
    [key: string]: any,
    DOMAIN_NAME: string,
    ACCOUNT_SID: string,
    AUTH_TOKEN: string
}

export type Env = {
    [key: string]: any,
    DOMAIN_NAME: string,
    ACCOUNT_SID: string,
    AUTH_TOKEN: string
}

export interface ActionThis {
    request: Record<string, unknown>
    cookies: Record<string, unknown>
    providers: Providers
    env: Env
}

export type Action = (this: ActionThis, event: Event) => Promise<unknown>

export type InjectionOptions = {
    providers: Providers,
    validateToken: boolean
}

export type TwilioFunction = (context: Context, event: Event, callback: import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback) => Promise<void>

export type UseInjection = (action: Action, options: InjectionOptions) => TwilioFunction
