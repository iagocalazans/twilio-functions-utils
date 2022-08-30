const { typeOf } = require('./type-of');

/**
 * The Result class provides an organized and simple way to return errors without having to wrap every request in Try Catches.
 *
 * @class
 */
class Result {
  /**
   * Stores the success return object as #data.
   *
   * @private
   */
  #data;

  /**
   * Stores the failed return object as #error.
   *
   * @private
   */
  #error;

  /**
   * @hideconstructor
   */
  constructor(data, error) {
    if (data instanceof Error) {
      this.#error = data;
      return;
    }

    this.#data = data;

    this.#error = error;
  }

  /**
   *  The static function to create new Result objects with the sucessfull data object.
   *
   * @param { * } data
   * @returns { Result }
   */
  static ok(data) {
    return new Result(data);
  }

  /**
   *  The static function to create new Result objects with the failed error object.
   *
   * @param { (Error|*) } error The error parameter could be of any of the primitive Javascript types, but you should mostly use an Error instance.
   * @returns { Result }
   */
  static failed(error) {
    return new Result(undefined, error);
  }

  /**
   * Check the class type, if it has an error, or not
   * @type { boolean }
   */
  get isError() {
    return !!this.#error;
  }

  /**
   * Retrieve the internal data object.
   * @readonly
   */
  get data() {
    if (typeOf(this.#error) !== 'Undefined') {
      throw new Error('This is not a successfull request. Result with error type instead.');
    }

    return this.#data;
  }

  /**
   * Retrieve the internal error object.
   * @readonly
   */
  get error() {
    if (typeOf(this.#data) !== 'Undefined') {
      throw new Error('This is a successfull request. Result with data type instead.');
    }

    return this.#error;
  }
}

module.exports = { Result };
