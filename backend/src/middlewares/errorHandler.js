// backend/src/middlewares/errorHandler.js
'use strict';

const logger = require('../utils/logger');

/**
 * Central Express error handler — always last middleware in app.js
 */
module.exports = function errorHandler(err, req, res, _next) {
  // Default values
  let statusCode = err.statusCode || 500;
  let message    = err.message    || 'Internal Server Error';
  let errors     = err.errors     || undefined;

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message    = 'Validation failed';
    errors     = Object.values(err.errors).map((e) => ({
      field:   e.path,
      message: e.message,
    }));
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? `"${field}"` : 'Value'} already exists`;
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message    = `Invalid ${err.path}: "${err.value}"`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  { statusCode = 401; message = 'Invalid token'; }
  if (err.name === 'TokenExpiredError')  { statusCode = 401; message = 'Token expired'; }

  // Log server errors
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} — ${statusCode}: ${message}`, {
      stack: err.stack,
      body:  req.body,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};


// ─────────────────────────────────────────────────────────────────────────────
// backend/src/middlewares/validate.js
const { validationResult } = require('express-validator');
const { AppError } = require('../utils/helpers');

/**
 * Reads express-validator results and throws formatted AppError
 */
exports.validate = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new AppError('Validation failed', 422, errors));
  }
  next();
};
