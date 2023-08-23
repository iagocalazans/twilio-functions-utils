import { TwilioClient } from '@twilio-labs/serverless-runtime-types/types'

export type useInjectionFn<T, X = {[key: string]: unknown}> = (this: {
    env: X,
    twilio: TwilioClient, 
    request: Record<string, string>, 
    cookies: Record<string, string>,
}, event: T) => Promise<any> | any

type useInjectionParams = {
    validateToken: boolean
}

type useMockParams = {
    env: {[key: string]: unknown},
    twilio: TwilioClient
}

/**
 * The useInjection method takes two parameters. The first to apply as a handler and the last is an object of configuration options.
 * It reduces the need to apply frequent try-catches and improving context management, making it no longer necessary to return the callback() method in all functions.
 */
export function useInjection<T>(fn: useInjectionFn<T>, params: useInjectionParams): (...args: any[]) => Promise<any> | any;

export function useMock<T>(fn: useInjectionFn<T>, params: useMockParams): (...args: any[]) => Promise<any> | any;

export class TwiMLResponse {
    constructor(body?: string, statusCode?: number);
    [Symbol.toStringTag]: string;
}

export class Response {
    constructor(body?: Record<string, any> | string, statusCode?: number);
}

/**
 * A more precisely type checker than Javascript built-in typeof.
 */
 export function typeOf(o: any): string | undefined;

 export class UnauthorizedError {
    constructor(body?: string);
    [Symbol.toStringTag]: string;
}

export class NotFoundError {
    constructor(body?: string);
    [Symbol.toStringTag]: string;
}

export class InternalServerError {
    constructor(body?: string);
    [Symbol.toStringTag]: string;
}

export class BadRequestError {
    constructor(body?: string);
    [Symbol.toStringTag]: string;
}

export function remap<Z, X, Y = unknown>(action: (arg: Z) => Promise<X[]>, model: (el: X) => Y): (arg: Z) => Promise<Y[]>

export function extract<Z extends keyof X, X = unknown>(property: Z): (el: X) => Pick<X, Z>