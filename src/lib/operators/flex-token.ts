import { Observable, from, of, throwError, pipe } from 'rxjs';
import { mergeMap, catchError } from 'rxjs/operators';
import { EffectContext } from '../effects/types';
import { UnauthorizedError } from '../errors/unauthorized.error';
const { validator } = require('twilio-flex-token-validator');

/**
 * Validates Twilio Flex token from the request
 */
export const validateFlexToken = <Env = {}, Providers = {}>() =>
  pipe(
    mergeMap((context: EffectContext<Env, Providers>) => {
      const token = context.event.Token || context.event.token;
      
      if (!token) {
        return throwError(() => new UnauthorizedError('Token is required'));
      }
      
      // Extract required environment variables
      const { ACCOUNT_SID, AUTH_TOKEN } = context.env as any;
      
      if (!ACCOUNT_SID || !AUTH_TOKEN) {
        return throwError(() => new Error('Missing ACCOUNT_SID or AUTH_TOKEN in environment'));
      }
      
      // Validate token using twilio-flex-token-validator
      return from(
        validator(token, ACCOUNT_SID, AUTH_TOKEN)
      ).pipe(
        mergeMap((validationResult: any) => {
          if (validationResult.valid) {
            // Add worker info to context
            return of({
              ...context,
              event: {
                ...context.event,
                TokenResult: validationResult
              }
            });
          }
          
          return throwError(() => new UnauthorizedError(
            validationResult.message || 'Invalid token'
          ));
        }),
        catchError((error: any) => {
          if (error instanceof UnauthorizedError) {
            return throwError(() => error);
          }
          return throwError(() => new UnauthorizedError('Token validation failed'));
        })
      );
    })
  );

/**
 * Validates Flex token with custom validation options
 */
export const validateFlexTokenWithOptions = <Env = {}, Providers = {}>(
  options: {
    tokenField?: string;
    accountSidField?: string;
    authTokenField?: string;
    onValidation?: (result: any) => void;
  } = {}
) =>
  pipe(
    mergeMap((context: EffectContext<Env, Providers>) => {
      const tokenField = options.tokenField || 'Token';
      const accountSidField = options.accountSidField || 'ACCOUNT_SID';
      const authTokenField = options.authTokenField || 'AUTH_TOKEN';
      
      const token = context.event[tokenField] || context.event[tokenField.toLowerCase()];
      
      if (!token) {
        return throwError(() => new UnauthorizedError(`${tokenField} is required`));
      }
      
      const accountSid = (context.env as any)[accountSidField];
      const authToken = (context.env as any)[authTokenField];
      
      if (!accountSid || !authToken) {
        return throwError(() => new Error(
          `Missing ${accountSidField} or ${authTokenField} in environment`
        ));
      }
      
      return from(
        validator(token, accountSid, authToken)
      ).pipe(
        mergeMap((validationResult: any) => {
          if (options.onValidation) {
            options.onValidation(validationResult);
          }
          
          if (validationResult.valid) {
            return of({
              ...context,
              event: {
                ...context.event,
                TokenResult: validationResult
              }
            });
          }
          
          return throwError(() => new UnauthorizedError(
            validationResult.message || 'Invalid token'
          ));
        }),
        catchError((error: any) => {
          if (error instanceof UnauthorizedError) {
            return throwError(() => error);
          }
          return throwError(() => new UnauthorizedError('Token validation failed'));
        })
      );
    })
  );

/**
 * Guards the effect with Flex token validation
 */
export const requireFlexAuth = <Env = {}, Providers = {}>() => 
  validateFlexToken<Env, Providers>();