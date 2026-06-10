// backend/src/middlewares/validate.js
'use strict';

const { validationResult } = require('express-validator');

/**
 * Reads express-validator results and returns a 422 with field errors.
 */
exports.validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  result.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
