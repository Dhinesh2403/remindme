// backend/src/middlewares/auth.js
'use strict';

const jwt  = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../utils/helpers');

/**
 * Verifies Bearer token and attaches req.user
 */
exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new AppError('No token provided', 401));
    }

    const token   = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user    = await User.findById(payload.sub).lean();

    if (!user) return next(new AppError('User not found', 401));

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(new AppError('Invalid token', 401));
  }
};

/**
 * Must come after authenticate
 */
exports.requireAdmin = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }
  next();
};

/**
 * Must come after authenticate
 */
exports.requirePremium = (req, _res, next) => {
  if (!req.user?.isPremium) {
    return next(new AppError('Premium subscription required', 403));
  }
  next();
};
