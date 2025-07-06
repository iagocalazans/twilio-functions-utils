import { Observable, pipe, throwError, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Result } from '../result';

/**
 * Automatically handles Result objects in the stream
 * If the value is a Result.failed, it throws the error
 * If the value is a Result.ok, it extracts the data
 */
export const handleResult = <T = any, E = any>() =>
  pipe(
    switchMap((value: any) => {
      // If it's a Result object
      if (value && typeof value === 'object' && 'isError' in value) {
        const result = value as Result<T, E>;
        
        if (result.isError) {
          // Convert Result error to thrown error
          const error = result.error;
          if (error instanceof Error) {
            return throwError(() => error);
          }
          return throwError(() => new Error(String(error)));
        }
        
        // Extract data from successful Result
        return of(result.data);
      }
      
      // If it's not a Result, pass through
      return of(value);
    })
  );

/**
 * Wraps the current value in a Result.ok
 */
export const toResultOk = <T = any>() =>
  pipe(
    map((value: T) => Result.ok(value))
  );

/**
 * Catches errors and wraps them in Result.failed
 */
export const toResultFailed = <E = any>() =>
  pipe(
    catchError((error: E) => of(Result.failed(error)))
  );

/**
 * Converts a stream to always emit Result objects
 * Success values become Result.ok, errors become Result.failed
 */
export const toResult = <T = any, E = any>() =>
  pipe(
    map((value: T) => Result.ok(value)),
    catchError((error: E) => of(Result.failed(error)))
  );

/**
 * Maps a function that returns a Result over the stream
 */
export const mapResult = <T = any, R = any, E = any>(
  fn: (value: T) => Result<R, E>
) =>
  pipe(
    map(fn),
    handleResult<R, E>()
  );

/**
 * FlatMaps a function that returns a Result over the stream
 */
export const switchMapResult = <T = any, R = any, E = any>(
  fn: (value: T) => Result<R, E> | Observable<Result<R, E>>
) =>
  pipe(
    switchMap((value: T) => {
      const result = fn(value);
      if (result instanceof Observable) {
        return result;
      }
      return of(result);
    }),
    handleResult<R, E>()
  );