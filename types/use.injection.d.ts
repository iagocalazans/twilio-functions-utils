import { TwilioClient } from '@twilio-labs/serverless-runtime-types/types'

export type Event = {
    request: Record<string, any>
    cookies: Record<string, string>
    Token?: string
}

export type Context = {
    getTwilioClient: () => TwilioClient,
    [key: string]: Env
}

export type Env = {
    [key: string]: any,
    DOMAIN_NAME: string,
    ACCOUNT_SID: string,
    AUTH_TOKEN: string
}

export type Providers = ProvidersThis
export type ProvidersContext = Omit<Providers, 'client' | 'env'>

export type Action<T> = (this: {
        request: Record<string, any>,
        cookies: Record<string, any>,
        providers: Providers,
        env: Env
    }, event: T & Event) => Promise<any>    

export type ProviderAction = (this: ProvidersThis, ...args: any) => Promise<any>

export type ProvidersThis = {
    client: TwilioClient,
    env: Env
    [key: string]: ProviderAction
}

export type InjectionOptions = {
    providers: ProvidersContext,
    validateToken: boolean
}

export type TwilioFunction = (context: Context, event: Event, callback: import('@twilio-labs/serverless-runtime-types/types').ServerlessCallback) => Promise<void>

export function useInjection<T>(action: Action<T>, options: InjectionOptions): TwilioFunction
