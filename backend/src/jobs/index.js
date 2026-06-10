// backend/src/jobs/index.js
'use strict';

const cron          = require('node-cron');
const Reminder      = require('../models/Reminder');
const User          = require('../models/User');
const notifService  = require('../services/notification.service');
const logger        = require('../utils/logger');

/**
 * Start all cron jobs.
 * Called once from app.js after DB is connected.
 */
function startJobs() {
  // ── Fire due reminders (every minute) ─────────────────────────────────
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const dueReminders = await Reminder.find({
        status:     { $in: ['pending', 'snoozed'] },
        nextFireAt: { $lte: now },
      }).populate('userId', 'name email phone notifPrefs pushSubscription');

      for (const reminder of dueReminders) {
        await fireReminder(reminder);
      }

      if (dueReminders.length > 0) {
        logger.info(`[Cron] Fired ${dueReminders.length} reminder(s)`);
      }
    } catch (err) {
      logger.error('[Cron] reminder-fire error:', err.message);
    }
  });

  // ── Mark overdue reminders as missed (every 5 minutes) ────────────────
  cron.schedule('*/5 * * * *', async () => {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const result = await Reminder.updateMany(
        {
          status:     'pending',
          nextFireAt: { $lt: fiveMinutesAgo },
        },
        { $set: { status: 'missed' } }
      );
      if (result.modifiedCount > 0) {
        logger.info(`[Cron] Marked ${result.modifiedCount} reminder(s) as missed`);
      }
    } catch (err) {
      logger.error('[Cron] missed-mark error:', err.message);
    }
  });

  // ── Update next fire date for recurring reminders (daily at midnight) ──
  cron.schedule('0 0 * * *', async () => {
    try {
      const recurring = await Reminder.find({
        status:      'done',
        repeatType:  { $ne: 'none' },
      });

      for (const r of recurring) {
        const next = computeNextDate(r.date, r.repeatType);
        await Reminder.findByIdAndUpdate(r._id, {
          date:   next,
          status: 'pending',
          snoozeCount: 0,
        });
      }
      logger.info(`[Cron] Reset ${recurring.length} recurring reminder(s)`);
    } catch (err) {
      logger.error('[Cron] recurrence error:', err.message);
    }
  });

  // ── Streak maintenance (daily at 1 AM) ────────────────────────────────
  cron.schedule('0 1 * * *', async () => {
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      // Users who haven't been active for more than 1 day — reset streak
      await User.updateMany(
        { lastActiveAt: { $lt: yesterday }, streak: { $gt: 0 } },
        { $set: { streak: 0 } }
      );
    } catch (err) {
      logger.error('[Cron] streak reset error:', err.message);
    }
  });

  logger.info('✅ Cron jobs started');
}

// ── Helpers ────────────────────────────────────────────────────────────────
async function fireReminder(reminder) {
  const user = reminder.userId;
  if (!user) return;

  const notifTypes = reminder.notificationTypes?.length
    ? reminder.notificationTypes
    : ['push'];

  await notifService.send({
    user,
    reminder,
    channels: notifTypes,
  });

  // Create in-app notification
  await notifService.createAndPush({
    userId:  user._id,
    type:    'reminder_due',
    title:   `⏰ ${reminder.title}`,
    message: reminder.description || 'Your reminder is due now!',
    data:    { reminderId: reminder._id },
  });
}

function computeNextDate(currentDate, repeatType) {
  const d = new Date(currentDate);
  switch (repeatType) {
    case 'daily':   d.setDate(d.getDate() + 1);    break;
    case 'weekly':  d.setDate(d.getDate() + 7);    break;
    case 'monthly': d.setMonth(d.getMonth() + 1);  break;
    case 'yearly':  d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

module.exports = { startJobs };
