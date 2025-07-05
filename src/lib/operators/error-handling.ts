import { Observable, of, throwError, pipe, EMPTY } from 'rxjs';
import { catchError, tap, map, retry, timeout } from 'rxjs/operators';
import { Response } from '../responses/default.response';
import { BadRequestError } from '../errors/bad-request.error';
import { InternalServerError } from '../errors/internal-server.error';
import { NotFoundError } from '../errors/not-found.error';
import { UnauthorizedError } from '../errors/unauthorized.error';

/**
 * Catches errors and maps them to appropriate error responses
 */
export const handleError = (
  errorMapper?: (error: any) => Response | null
) =>
  pipe(
    catchError((error: any) => {
      // If already a Response, return it
      if (error instanceof Response) {
        return of(error);
      }
      
      // Try custom error mapper first
      if (errorMapper) {
        const mapped = errorMapper(error);
        if (mapped) {
          return of(mapped);
        }
      }
      
      // Default error mapping
      if (error.status === 400 || error.name === 'ValidationError') {
        return of(new BadRequestError(error.message || 'Bad request'));
      }
      
      if (error.status === 401 || error.name === 'AuthenticationError') {
        return of(new UnauthorizedError(error.message || 'Unauthorized'));
      }
      
      if (error.status === 404 || error.name === 'NotFoundError') {
        return of(new NotFoundError(error.message || 'Not found'));
      }
      
      // Default to internal server error
      return of(new InternalServerError(error.message || 'Internal server error'));
    })
  );

/**
 * Logs errors without interrupting the stream
 */
export const logError = (
  logger: (error: any) => void = console.error
) =>
  pipe(
    catchError((error: any) => {
      logger(error);
      return throwError(() => error);
    })
  );

/**
 * Retries the operation on error
 */
export const retryWithBackoff = (
  maxRetries: number = 3,
  delayMs: number = 1000,
  backoffMultiplier: number = 2
) =>
  pipe(
    retry({
      count: maxRetries,
      delay: (error, retryCount) => {
        const delay = delayMs * Math.pow(backoffMultiplier, retryCount - 1);
        return new Observable(subscriber => {
          setTimeout(() => {
            subscriber.next(undefined);
            subscriber.complete();
          }, delay);
        });
      }
    })
  );

/**
 * Maps specific error types to custom responses
 */
export const mapErrorType = <T extends Error>(
  ErrorType: new (...args: any[]) => T,
  responseFactory: (error: T) => Response
) =>
  pipe(
    catchError((error: any) => {
      if (error instanceof ErrorType) {
        return of(responseFactory(error));
      }
      return throwError(() => error);
    })
  );

/**
 * Provides a fallback value on error
 */
export const fallback = <T = any>(
  fallbackValue: T | (() => T)
) =>
  pipe(
    catchError(() => {
      const value = typeof fallbackValue === 'function' 
        ? (fallbackValue as () => T)() 
        : fallbackValue;
      return of(value);
    })
  );

/**
 * Times out the operation and returns an error response
 */
export const timeoutWithError = (
  ms: number,
  errorMessage: string = 'Request timeout'
) =>
  pipe(
    timeout({
      each: ms,
      with: () => throwError(() => new InternalServerError(errorMessage))
    })
  );

/**
 * Validates the result and throws an error if validation fails
 */
export const validate = <T = any>(
  validator: (value: T) => boolean | { valid: boolean; error?: string },
  errorFactory: (error?: string) => Response = (msg) => new BadRequestError(msg || 'Validation failed')
) =>
  pipe(
    map((value: T) => {
      const result = validator(value);
      
      if (typeof result === 'boolean') {
        if (!result) {
          throw errorFactory();
        }
      } else {
        if (!result.valid) {
          throw errorFactory(result.error);
        }
      }
      
      return value;
    })
  );

/**
 * Ensures the stream always completes successfully with a response
 */
export const ensureResponse = (
  defaultResponse: Response = new InternalServerError('Unknown error')
) =>
  pipe(
    catchError(() => of(defaultResponse)),
    map(value => value instanceof Response ? value : new Response(value as any))
  );

/**
 * Catches and ignores specific error types
 */
export const ignoreErrors = <T extends Error>(
  ...ErrorTypes: Array<new (...args: any[]) => T>
) =>
  pipe(
    catchError((error: any) => {
      if (ErrorTypes.some(ErrorType => error instanceof ErrorType)) {
        return EMPTY;
      }
      return throwError(() => error);
    })
  );