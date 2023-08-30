import { TwilioClient } from '@twilio-labs/serverless-runtime-types/types'

export type useInjectionFn<T, X = {[key: string]: unknown}, Z = {[key: string]: unknown}> = (this: ObjectThis<X, Z>, event: T) => Promise<any> | any

export type ObjectThis<T = unknown, X = Record<string, string>> = {
  env: T,
  twilio: TwilioClient, 
  request: Record<string, string>, 
  cookies: X,
}

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
export function useInjection<T, X, Z>(fn: useInjectionFn<T, X, Z>, params: useInjectionParams): (...args: unknown[]) => Promise<void> | void;

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

export function transformListTo<Z, X, Y = unknown>(action: (arg: Z) => Promise<X[]>, model: (el: X) => Y): (arg: Z) => Promise<Y[]>

export function transformInstanceTo<Z, X, Y = unknown>(action: (arg: Z) => Promise<X>, model: (el: X) => Y): (arg: Z) => Promise<Y>

export function extract<Z extends keyof X, X = unknown>(property: Z): (el: X) => Pick<X, Z>

export function factory<Z = {[key in Z]: Z[key]; new (el: X): Z}, X = unknown>(Instance: Z): (el: X) => InstanceType<Z>


type FN = (...args: any[]) => any;
type FNA = (...args: unknown[]) => Promise<unknown>;

type FnsMatchPipe<FNS extends FN[]> =
  1 extends FNS["length"]
    ? boolean
    : FNS extends [
        infer FN1st extends FN,
        infer FN2nd extends FN,
        ...infer FNRest extends FN[]
      ]
    ? Parameters<FN2nd> extends [ReturnType<FN1st>]
      ? FnsMatchPipe<[FN2nd, ...FNRest]>
      : never
    : never;

export function pipe<FNS extends FN[]>(...fns: FNS): FN {
    return fns.reduce(
      (result, f) =>
        (...args) =>
          f(result(...args))
    );
  }
  
export function pipeAsync<FNS extends FNA[]>(...fns: FNS): FNA {
  return fns.reduce(
    (result, f) =>
      async (...args) =>
        f(await result(...args))
  );
}

export const TWILIO_TYPES = {
  Functions: 'function',
  Assets: 'asset',
}

export const useTwilioImport = <T = {twilio: TwilioClient}>(objectThis: T) => (type: TWILIO_TYPES, name: string, path: string) => {
    return function <X = any[], Z = any>(this: T, ...args: X): Promise<Z> {}
  }
