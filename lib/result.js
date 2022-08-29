const { typeOf } = require('./type-of');

/**
 * The Result class provides an organized and simple way to return errors without having to wrap every request in Try Catches.
 *
 * @class
 */
class Result {
  #data;

  #error;

  constructor(data, error) {
    if (data instanceof Error) {
      this.#error = data;
      return;
    }

    this.#data = data;

    this.#error = error;
  }

  static ok(data) {
    return new Result(data);
  }

  static failed(error) {
    return new Result(undefined, error);
  }

  /**
   * Check the class type, if it has an error, or not
   */
  get isError() {
    return !!this.#error;
  }

  get data() {
    if (typeOf(this.#error) !== 'Undefined') {
      throw new Error('This is not a successfull request. Result with error type instead.');
    }

    return this.#data;
  }

  get error() {
    if (typeOf(this.#data) !== 'Undefined') {
      throw new Error('This is a successfull request. Result with data type instead.');
    }

    return this.#error;
  }
}

module.exports = { Result };
