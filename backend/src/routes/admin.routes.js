// backend/src/routes/admin.routes.js
'use strict';

const router = require('express').Router();
const { body } = require('express-validator');
const ctrl   = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

router.use(authenticate, requireAdmin);

router.get('/stats',    ctrl.getDashboardStats);
router.get('/users',    ctrl.getUsers);
router.patch('/users/:id/premium',
  [body('isPremium').isBoolean()],
  validate,
  ctrl.togglePremium
);
router.get('/reminders', ctrl.getAllReminders);

module.exports = router;
