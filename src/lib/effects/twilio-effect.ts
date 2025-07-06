import { Observable, from, of, throwError, forkJoin, isObservable, firstValueFrom } from 'rxjs';
import { catchError, map, mergeMap, take } from 'rxjs/operators';
import * as Twilio from 'twilio';
import { ServerlessCallback } from '@twilio-labs/serverless-runtime-types/types';
import { 
  TwilioEvent, 
  TwilioContext, 
  EffectWithContext, 
  EffectOptions, 
  EffectContext,
  ProvidersFactory
} from './types';
import { Response } from '../responses/default.response';
import { InternalServerError } from '../errors/internal-server.error';

export function twilioEffect<Env = {}, Providers = {}>(
  effect: EffectWithContext<Env, Providers>,
  options: EffectOptions<Env, Providers> = {}
) {
  return async function handler(
    context: TwilioContext<Env>,
    event: TwilioEvent,
    callback: ServerlessCallback
  ) {
    try {
      // Create Twilio client
      const client = (context as any).getTwilioClient() as Twilio.Twilio;
      
      // Extract environment without getTwilioClient
      const { getTwilioClient, ...env } = context as any;
      
      // Extract request data
      const request = {
        headers: event._headers || {},
        cookies: event._cookies || {}
      };
      
      // Initialize providers
      const providers = await initializeProviders(
        options.providers as ProvidersFactory<Env, Providers>, 
        { client, env: env as Env }
      );
      
      // Create effect context
      const effectContext: EffectContext<Env, Providers> = {
        event,
        context,
        env: env as Env,
        providers,
        client,
        request
      };
      
      // Create context observable
      const context$ = of(effectContext);
      
      // Execute effect
      effect(context$)
        .pipe(
          take(1),
          map(response => {
            if (response instanceof Response) {
              return response;
            }
            return new Response(response);
          }),
          catchError(error => {
            if (error instanceof Response) {
              return of(error);
            }
            return of(new InternalServerError(error.message || 'Internal server error'));
          })
        )
        .subscribe({
          next: (response) => callback(null, response),
          error: (error) => callback(null, new InternalServerError(error.message || 'Unexpected error'))
        });
        
    } catch (error: any) {
      callback(null, new InternalServerError(error.message || 'Handler initialization failed'));
    }
  };
}

async function initializeProviders<Env, Providers>(
  providersFactory: ProvidersFactory<Env, Providers> | undefined,
  context: { client: Twilio.Twilio; env: Env }
): Promise<Providers> {
  if (!providersFactory) {
    return {} as Providers;
  }
  
  const providers: any = {};
  const providerPromises: { [key: string]: Observable<any> } = {};
  
  // Convert all providers to observables
  for (const [key, factory] of Object.entries(providersFactory)) {
    const result = (factory as any)(context);
    
    if (isObservable(result)) {
      providerPromises[key] = result.pipe(take(1));
    } else if (result instanceof Promise) {
      providerPromises[key] = from(result);
    } else {
      providers[key] = result;
    }
  }
  
  // Wait for all async providers
  if (Object.keys(providerPromises).length > 0) {
    const resolvedProviders = await firstValueFrom(forkJoin(providerPromises));
    Object.assign(providers, resolvedProviders);
  }
  
  return providers as Providers;
}