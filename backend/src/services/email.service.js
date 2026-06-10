// backend/src/services/email.service.js
'use strict';

const nodemailer = require('nodemailer');
const logger     = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'sandbox.smtp.mailtrap.io',
  port:   Number(process.env.SMTP_PORT) || 2525,
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = `"RemindMe Buddy 🔔" <${process.env.EMAIL_FROM || 'noreply@remindmebuddy.com'}>`;

// ── Welcome email ─────────────────────────────────────────────────────────
exports.sendWelcome = async (user) => {
  await transporter.sendMail({
    from:    FROM,
    to:      user.email,
    subject: '🎉 Welcome to RemindMe Buddy!',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <div style="background:#7C3AED;padding:28px;border-radius:16px 16px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:24px">🔔 RemindMe Buddy</h1>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #E5E7EB">
          <h2 style="color:#1F2937">Welcome, ${user.name}! 👋</h2>
          <p style="color:#4B5563">You're all set to start managing your reminders and holding each other accountable.</p>
          <div style="background:#F8F7FF;border-radius:12px;padding:20px;margin:20px 0">
            <p style="margin:0;color:#6B7280;font-size:14px">✅ Create unlimited reminders<br>👥 Add accountability buddies<br>📅 Never miss an important date</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:8100'}/app/home"
             style="display:block;background:#7C3AED;color:white;text-decoration:none;padding:14px;text-align:center;border-radius:12px;font-weight:700;margin-top:20px">
            Open RemindMe Buddy →
          </a>
        </div>
      </div>`,
  });
  logger.info(`Welcome email sent to ${user.email}`);
};

// ── OTP email ─────────────────────────────────────────────────────────────
exports.sendOtp = async (user, otp) => {
  await transporter.sendMail({
    from:    FROM,
    to:      user.email,
    subject: `${otp} — Your RemindMe Buddy verification code`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <div style="background:#7C3AED;padding:24px;border-radius:16px 16px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">🔐 Verification Code</h1>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #E5E7EB">
          <p style="color:#4B5563">Hi ${user.name}, use this OTP to verify your account:</p>
          <div style="background:#EDE9FE;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
            <span style="font-size:36px;font-weight:900;color:#7C3AED;letter-spacing:8px">${otp}</span>
          </div>
          <p style="color:#9CA3AF;font-size:13px">This code expires in 5 minutes. Do not share it with anyone.</p>
        </div>
      </div>`,
  });
};

// ── Password reset email ──────────────────────────────────────────────────
exports.sendPasswordReset = async (user, token) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:8100'}/auth/reset-password?token=${token}`;
  await transporter.sendMail({
    from:    FROM,
    to:      user.email,
    subject: '🔑 Reset your RemindMe Buddy password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <div style="background:#7C3AED;padding:24px;border-radius:16px 16px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">🔑 Password Reset</h1>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #E5E7EB">
          <p style="color:#4B5563">Hi ${user.name},</p>
          <p style="color:#4B5563">We received a request to reset your password. Click the button below — this link expires in 1 hour.</p>
          <a href="${resetUrl}"
             style="display:block;background:#7C3AED;color:white;text-decoration:none;padding:14px;text-align:center;border-radius:12px;font-weight:700;margin:20px 0">
            Reset Password →
          </a>
          <p style="color:#9CA3AF;font-size:12px">If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
        </div>
      </div>`,
  });
};

// ── Reminder notification email ───────────────────────────────────────────
exports.sendReminderEmail = async (user, reminder) => {
  await transporter.sendMail({
    from:    FROM,
    to:      user.email,
    subject: `⏰ Reminder: ${reminder.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <div style="background:#7C3AED;padding:24px;border-radius:16px 16px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">⏰ Reminder Due</h1>
        </div>
        <div style="background:white;padding:32px;border-radius:0 0 16px 16px;border:1px solid #E5E7EB">
          <h2 style="color:#7C3AED;margin:0 0 8px">${reminder.title}</h2>
          ${reminder.description ? `<p style="color:#6B7280">${reminder.description}</p>` : ''}
          <p style="color:#9CA3AF;font-size:13px">📅 ${reminder.time}</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:8100'}/app/reminders/${reminder._id}"
             style="display:block;background:#7C3AED;color:white;text-decoration:none;padding:14px;text-align:center;border-radius:12px;font-weight:700;margin-top:20px">
            Open Reminder →
          </a>
        </div>
      </div>`,
  });
};
