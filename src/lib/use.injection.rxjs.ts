import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { twilioEffect } from './effects/twilio-effect';
import { handleError } from './operators/error-handling';
import { validateFlexToken } from './operators/flex-token';
import { Result } from './result';
import { Response } from './responses/default.response';

// Import original types for compatibility
import type { 
  InjectorFunction, 
  ProviderFunction, 
  InjectorThis, 
  EnvironmentVars 
} from './use.injection';

interface InjectorOptions {
  providers?: Record<string, ProviderFunction>;
  validateToken?: boolean;
}

/**
 * RxJS-powered replacement for useInjection that maintains the exact same API
 * but uses reactive streams under the hood for better composition and testing.
 */
export const useInjection = <
  Data = Record<string, any>,
  Env extends EnvironmentVars = any,
  Providers extends Record<string, ProviderFunction> = any
>(
  fn: InjectorFunction<Data, Env, Providers>,
  params: InjectorOptions = {}
) => {
  // Convert the regular function to an RxJS Effect
  const effect = (context$: Observable<any>) =>
    context$.pipe(
      // Apply Flex token validation if requested
      switchMap(context => 
        params.validateToken 
          ? validateFlexToken<Env, Providers>()(of(context))
          : of(context)
      ),
      
      // Extract all the context parts that the original function expects
      switchMap(context => {
        const { event, env, client, providers, request } = context;
        
        // Extract event data exactly like the original: { request, cookies, Token, ...values }
        const { request: eventRequest = {}, cookies: eventCookies = {}, Token, ...values } = event;
        
        // Create proper request object combining all sources
        const requestData = {
          headers: request?.headers || eventRequest.headers || {},
          cookies: request?.cookies || eventCookies || {},
          ...eventRequest
        };
        
        // Create the 'this' context exactly like the original useInjection
        const injectorThis: InjectorThis<Env, Providers> = {
          request: requestData,
          cookies: requestData.cookies,
          env: env as Omit<any, 'getTwilioClient'>,
          providers: providers as Providers,
          event: event // Add the missing event property that tests expect
        } as any;
        
        // Execute the original function with proper 'this' binding and sanitized values
        try {
          const result = fn.call(injectorThis, values as Data);
          
          // Handle both sync and async results
          if (result instanceof Promise) {
            return from(result);
          }
          
          return of(result);
        } catch (error) {
          throw error;
        }
      }),
      
      // Ensure the result is always a Response object
      map((result: any) => {
        // If it's already a Response (including error responses), return as-is
        if (result instanceof Response) {
          return result;
        }
        
        // If it's a Result object, handle it appropriately
        if (result && typeof result === 'object' && 'isError' in result) {
          const resultObj = result as Result<any, any>;
          if (resultObj.isError) {
            // This should have been caught earlier, but just in case
            throw new Error(resultObj.error);
          }
          return new Response(resultObj.data as any);
        }
        
        // For any other value, wrap it in a Response
        return new Response(result as any);
      }),
      
      // Handle any errors that occurred
      handleError()
    );

  // Convert providers to the format expected by twilioEffect
  const providersFactory = params.providers ? 
    Object.entries(params.providers).reduce((acc, [key, providerFn]) => {
      acc[key] = ({ client, env }: { client: any; env: any }) => {
        // Create the provider exactly like the original - return the bound function itself, not a factory
        const providerThis = { client, env };
        return providerFn.bind(providerThis);
      };
      return acc;
    }, {} as any) : undefined;

  // Return a twilioEffect with the converted Effect
  return twilioEffect(effect, {
    providers: providersFactory,
    validateToken: params.validateToken
  });
};

/**
 * Backward compatibility: re-export the original types
 */
export type { 
  InjectorFunction, 
  ProviderFunction, 
  InjectorThis, 
  EnvironmentVars 
} from './use.injection';