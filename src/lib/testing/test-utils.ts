import { TestScheduler } from 'rxjs/testing';
import { Observable } from 'rxjs';

/**
 * Creates a test scheduler for marble testing
 */
export function createTestScheduler() {
  return new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
}

/**
 * Helper for marble testing with automatic scheduler run
 */
export function marbleTest(
  testFn: (helpers: {
    cold: typeof TestScheduler.prototype.createColdObservable;
    hot: typeof TestScheduler.prototype.createHotObservable;
    expectObservable: typeof TestScheduler.prototype.expectObservable;
    expectSubscriptions: typeof TestScheduler.prototype.expectSubscriptions;
    flush: typeof TestScheduler.prototype.flush;
  }) => void
) {
  const scheduler = createTestScheduler();
  scheduler.run(testFn);
}

/**
 * Converts an observable to a promise for easier testing
 */
export function toPromise<T>(observable: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    let value: T;
    observable.subscribe({
      next: (v) => { value = v; },
      error: reject,
      complete: () => resolve(value)
    });
  });
}

/**
 * Creates a mock observable that emits values with delays
 */
export function mockDelayedObservable<T>(values: T[], delayMs: number = 10): Observable<T> {
  return new Observable(subscriber => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < values.length) {
        subscriber.next(values[index]);
        index++;
      } else {
        clearInterval(interval);
        subscriber.complete();
      }
    }, delayMs);
    
    return () => clearInterval(interval);
  });
}

/**
 * Asserts that an observable emits specific values
 */
export async function expectEmissions<T>(
  observable: Observable<T>,
  expectedValues: T[]
): Promise<void> {
  const emissions: T[] = [];
  
  return new Promise((resolve, reject) => {
    observable.subscribe({
      next: (value) => emissions.push(value),
      error: reject,
      complete: () => {
        try {
          expect(emissions).toEqual(expectedValues);
          resolve();
        } catch (error) {
          reject(error);
        }
      }
    });
  });
}

/**
 * Asserts that an observable errors with a specific error
 */
export async function expectError<E = any>(
  observableOrPromise: Observable<any> | Promise<any>,
  errorMatcher?: (error: E) => boolean | void
): Promise<E> {
  // Handle promises
  if (observableOrPromise instanceof Promise) {
    try {
      await observableOrPromise;
      throw new Error('Expected promise to reject but it resolved');
    } catch (error) {
      if (errorMatcher) {
        const result = errorMatcher(error as E);
        if (result === false) {
          throw new Error('Error did not match expected criteria');
        }
      }
      return error as E;
    }
  }
  
  // Handle observables
  const observable = observableOrPromise as Observable<any>;
  return new Promise((resolve, reject) => {
    observable.subscribe({
      next: () => reject(new Error('Expected observable to error but it emitted a value')),
      error: (error) => {
        if (errorMatcher) {
          try {
            const result = errorMatcher(error);
            if (result === false) {
              reject(new Error('Error did not match expected criteria'));
            } else {
              resolve(error);
            }
          } catch (e) {
            reject(e);
          }
        } else {
          resolve(error);
        }
      },
      complete: () => reject(new Error('Expected observable to error but it completed'))
    });
  });
}