
/**
 * Custom InputError
 */
class InputError extends Error {
  /**
   * Create InputError
   * @param {String} message
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom AuthError
 */
class AuthError extends Error {
  /**
   * Create AuthError
   * @param {String} message
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Custom NotFoundError
 */
class NotFoundError extends Error {
  /**
   * Create NotFoundError
   * @param {String} message
   */
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  InputError: InputError,
  AuthError: AuthError,
  NotFoundError: NotFoundError
};
