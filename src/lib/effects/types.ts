import { Observable } from 'rxjs';
import * as Twilio from 'twilio';
import { Context, ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';

export interface TwilioEvent {
  [key: string]: any;
}

export interface TwilioContext<Env = {}> {
  getTwilioClient(): Twilio.Twilio;
  DOMAIN_NAME: string;
  PATH: string;
  SERVICE_SID: string | undefined;
  ENVIRONMENT_SID: string | undefined;
}

export interface EffectContext<Env = {}, Providers = {}> {
  event: TwilioEvent;
  context: TwilioContext<Env>;
  env: Env;
  providers: Providers;
  client: Twilio.Twilio;
  request: {
    headers: { [key: string]: string };
    cookies: { [key: string]: string };
  };
}

export type Effect<Env = {}, Providers = {}, Response = any> = (
  event$: Observable<TwilioEvent>
) => Observable<Response>;

export type EffectWithContext<Env = {}, Providers = {}, Response = any> = (
  context$: Observable<EffectContext<Env, Providers>>
) => Observable<Response>;

export interface EffectOptions<Env = {}, Providers = {}> {
  providers?: Providers;
  validateToken?: boolean;
}

export type ProviderFactory<Env = {}, T = any> = (context: {
  client: Twilio.Twilio;
  env: Env;
}) => T | Observable<T>;

export type ProvidersFactory<Env = {}, Providers = {}> = {
  [K in keyof Providers]: ProviderFactory<Env, Providers[K]>;
};