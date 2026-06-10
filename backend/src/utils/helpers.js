// backend/src/utils/helpers.js
'use strict';

/**
 * Wraps an async route handler — catches errors and forwards to next()
 */
exports.asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom application error with HTTP status code
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.name       = 'AppError';
    this.statusCode = statusCode;
    if (errors) this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
exports.AppError = AppError;
