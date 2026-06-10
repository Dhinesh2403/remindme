// backend/src/controllers/notification.controller.js
'use strict';

const Notification  = require('../models/Notification');
const User          = require('../models/User');
const webpush       = require('web-push');
const { asyncHandler, AppError } = require('../utils/helpers');

// ── GET /api/notifications ────────────────────────────────────────────────
exports.getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, unread } = req.query;
  const filter = { userId: req.user._id };
  if (unread === 'true') filter.isRead = false;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Notification.countDocuments(filter);
  const data  = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();

  res.json({ success: true, data, total, page: Number(page) });
});

// ── GET /api/notifications/unread-count ───────────────────────────────────
exports.unreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.json({ success: true, count });
});

// ── PATCH /api/notifications/:id/read ────────────────────────────────────
exports.markRead = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
  if (!n) throw new AppError('Notification not found', 404);
  res.json({ success: true, data: n });
});

// ── PATCH /api/notifications/read-all ────────────────────────────────────
exports.markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );
  res.json({ success: true, message: 'All notifications marked as read' });
});

// ── DELETE /api/notifications/:id ─────────────────────────────────────────
exports.remove = asyncHandler(async (req, res) => {
  const n = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!n) throw new AppError('Notification not found', 404);
  res.json({ success: true, message: 'Notification deleted' });
});

// ── POST /api/notifications/subscribe ────────────────────────────────────
exports.subscribe = asyncHandler(async (req, res) => {
  const { endpoint, keys } = req.body;
  if (!endpoint || !keys?.auth || !keys?.p256dh) {
    throw new AppError('Invalid push subscription object', 400);
  }
  await User.findByIdAndUpdate(req.user._id, {
    pushSubscription: { endpoint, keys },
  });
  res.json({ success: true, message: 'Push subscription saved' });
});

// ── DELETE /api/notifications/unsubscribe ─────────────────────────────────
exports.unsubscribe = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: { pushSubscription: '' },
  });
  res.json({ success: true, message: 'Unsubscribed from push notifications' });
});
