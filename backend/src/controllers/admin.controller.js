// backend/src/controllers/admin.controller.js
'use strict';

const User         = require('../models/User');
const Reminder     = require('../models/Reminder');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../utils/helpers');

// ── GET /api/admin/stats ──────────────────────────────────────────────────
exports.getDashboardStats = asyncHandler(async (_req, res) => {
  const [totalUsers, premiumUsers, totalReminders, doneReminders, missedReminders] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isPremium: true }),
      Reminder.countDocuments(),
      Reminder.countDocuments({ status: 'done' }),
      Reminder.countDocuments({ status: 'missed' }),
    ]);

  const completionRate = totalReminders > 0
    ? Math.round((doneReminders / totalReminders) * 100)
    : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      premiumUsers,
      freeUsers: totalUsers - premiumUsers,
      totalReminders,
      doneReminders,
      missedReminders,
      completionRate,
    },
  });
});

// ── GET /api/admin/users ──────────────────────────────────────────────────
exports.getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, isPremium } = req.query;
  const filter = {};
  if (search)              filter.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
  if (isPremium !== undefined) filter.isPremium = isPremium === 'true';

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-refreshTokens -password -otp -otpExpiry')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, data: users, total, page: Number(page) });
});

// ── PATCH /api/admin/users/:id/premium ────────────────────────────────────
exports.togglePremium = asyncHandler(async (req, res) => {
  const { isPremium, expiryDays = 30 } = req.body;
  const expiry = isPremium
    ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
    : null;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isPremium, premiumExpiry: expiry },
    { new: true }
  );
  res.json({ success: true, data: user });
});

// ── GET /api/admin/reminders ──────────────────────────────────────────────
exports.getAllReminders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, type } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type)   filter.type   = type;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Reminder.countDocuments(filter);
  const data  = await Reminder.find(filter)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json({ success: true, data, total, page: Number(page) });
});
