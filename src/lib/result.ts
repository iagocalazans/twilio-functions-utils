import { typeOf } from './type-of';

/**
 * The Result class provides an organized and simple way to return errors without having to wrap every request in Try Catches.
 */
export class Result<T = any, E = Error> {
  private readonly _data?: T;
  private readonly _error?: E;

  private constructor(data?: T, error?: E) {
    if (data instanceof Error) {
      this._error = data as unknown as E;
      return;
    }

    this._data = data;
    this._error = error;
  }

  /**
   * The static function to create new Result objects with the successful data object.
   */
  static ok<T>(data: T): Result<T, never> {
    return new Result(data);
  }

  /**
   * The static function to create new Result objects with the failed error object.
   * The error parameter could be of any of the primitive Javascript types, but you should mostly use an Error instance.
   */
  static failed<E>(error: E): Result<never, E> {
    return new Result(undefined, error) as Result<never, E>;
  }

  /**
   * Check the class type, if it has an error, or not
   */
  get isError(): boolean {
    return !!this._error;
  }

  /**
   * Retrieve the internal data object.
   * @readonly
   */
  get data(): T {
    if (typeOf(this._error) !== 'undefined') {
      throw new Error('This is not a successful request. Result with error type instead.');
    }

    return this._data!;
  }

  /**
   * Retrieve the internal error object.
   * @readonly
   */
  get error(): E {
    if (typeOf(this._data) !== 'undefined') {
      throw new Error('This is a successful request. Result with data type instead.');
    }

    return this._error!;
  }
}