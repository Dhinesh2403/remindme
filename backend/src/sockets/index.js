// backend/src/sockets/index.js
'use strict';

const { Server }    = require('socket.io');
const jwt           = require('jsonwebtoken');
const User          = require('../models/User');
const logger        = require('../utils/logger');

let io;

/**
 * Initialize Socket.IO with JWT authentication middleware
 */
function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin:      process.env.FRONTEND_URL || 'http://localhost:8100',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  });

  // ── Auth middleware ────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));

      const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user    = await User.findById(payload.sub).lean();
      if (!user) return next(new Error('User not found'));

      socket.user   = user;
      socket.userId = String(user._id);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ─────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const uid = socket.userId;
    logger.info(`[Socket] User connected: ${uid} (${socket.id})`);

    // Join personal room for targeted messages
    socket.join(`user:${uid}`);

    // ── Client events ──────────────────────────────────────────────────
    socket.on('notification:read', async ({ notificationId }) => {
      try {
        const { Notification } = require('../models/Reminder');
        await Notification.findByIdAndUpdate(notificationId, {
          isRead: true,
          readAt: new Date(),
        });
      } catch (e) {
        logger.warn('[Socket] notification:read error:', e.message);
      }
    });

    socket.on('reminder:typing', ({ friendId }) => {
      io.to(`user:${friendId}`).emit('friend:typing', { userId: uid });
    });

    socket.on('disconnect', (reason) => {
      logger.info(`[Socket] User disconnected: ${uid} — reason: ${reason}`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
}

/**
 * Get the Socket.IO instance (use in controllers)
 */
function getIO() {
  return io;
}

/**
 * Emit an event to a specific user room
 */
function emitToUser(userId, event, data) {
  if (!io) { logger.warn('[Socket] io not initialized'); return; }
  io.to(`user:${userId}`).emit(event, data);
}

module.exports = { initSocket, getIO, emitToUser };
