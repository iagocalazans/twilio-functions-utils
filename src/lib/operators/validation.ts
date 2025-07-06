import { Observable, of, throwError, from, pipe } from 'rxjs';
import { mergeMap, catchError, map } from 'rxjs/operators';
import { EffectContext } from '../effects/types';
import { BadRequestError } from '../errors/bad-request.error';
import { UnauthorizedError } from '../errors/unauthorized.error';

/**
 * Validates the event data against a schema or validation function
 */
export const validateEvent = <Env = {}, Providers = {}, T = any>(
  validator: (event: any) => boolean | Promise<boolean> | { valid: boolean; error?: string }
) =>
  pipe(
    mergeMap((context: EffectContext<Env, Providers>) =>
      from(Promise.resolve(validator(context.event))).pipe(
        mergeMap(result => {
          if (typeof result === 'boolean') {
            return result ? of(context) : throwError(() => new BadRequestError('Invalid request data'));
          }
          return result.valid 
            ? of(context) 
            : throwError(() => new BadRequestError(result.error || 'Invalid request data'));
        })
      )
    )
  );

/**
 * Validates that required fields exist in the event
 */
export const requireFields = <Env = {}, Providers = {}>(
  ...fields: string[]
) =>
  pipe(
    validateEvent<Env, Providers>((event) => {
      const missingFields = fields.filter(field => !event[field]);
      return {
        valid: missingFields.length === 0,
        error: missingFields.length > 0 
          ? `Missing required fields: ${missingFields.join(', ')}`
          : undefined
      };
    })
  );

/**
 * Validates the environment has required variables
 */
export const requireEnvVars = <Env = {}, Providers = {}>(
  ...vars: (keyof Env)[]
) =>
  pipe(
    mergeMap((context: EffectContext<Env, Providers>) => {
      const missingVars = vars.filter(varName => !context.env[varName]);
      return missingVars.length === 0
        ? of(context)
        : throwError(() => new BadRequestError(`Missing environment variables: ${missingVars.join(', ')}`));
    })
  );

/**
 * Transforms the event data
 */
export const transformEvent = <Env = {}, Providers = {}, T = any>(
  transformer: (event: any) => T | Promise<T>
) =>
  pipe(
    mergeMap((context: EffectContext<Env, Providers>) =>
      from(Promise.resolve(transformer(context.event))).pipe(
        map(transformedEvent => ({
          ...context,
          event: transformedEvent
        }))
      )
    )
  );

/**
 * Guards the effect with an authentication check
 */
export const authenticated = <Env = {}, Providers = {}>(
  authCheck: (context: EffectContext<Env, Providers>) => boolean | Promise<boolean> | Observable<boolean>
) =>
  pipe(
    mergeMap((context: EffectContext<Env, Providers>) => {
      const result = authCheck(context);
      
      if (result instanceof Observable) {
        return result.pipe(
          mergeMap(isAuth => isAuth ? of(context) : throwError(() => new UnauthorizedError('Authentication required')))
        );
      }
      
      return from(Promise.resolve(result)).pipe(
        mergeMap(isAuth => isAuth ? of(context) : throwError(() => new UnauthorizedError('Authentication required')))
      );
    })
  );