// backend/src/config/database.js
'use strict';

const mongoose = require('mongoose');
const logger   = require('../utils/logger');

const MAX_RETRIES    = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Establishes MongoDB connection with retry logic.
 * Reads MONGO_URI from the environment (set per .env.{NODE_ENV}).
 */
async function connectDB(attempt = 1) {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Recommended production options
      maxPoolSize:         10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS:     45000,
      family:              4,   // Force IPv4
    });

    logger.info(`✅ MongoDB connected: ${conn.connection.host} [${process.env.NODE_ENV}]`);

    // Connection event listeners
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected — reconnecting...');
      setTimeout(() => connectDB(), RETRY_DELAY_MS);
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err.message);
    });

  } catch (err) {
    logger.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);

    if (attempt < MAX_RETRIES) {
      logger.info(`Retrying in ${RETRY_DELAY_MS / 1000}s... (${attempt}/${MAX_RETRIES})`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return connectDB(attempt + 1);
    }

    logger.error('Max MongoDB retries reached. Shutting down.');
    process.exit(1);
  }
}

module.exports = connectDB;
