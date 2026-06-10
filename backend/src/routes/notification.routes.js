// backend/src/routes/notification.routes.js
'use strict';

const router = require('express').Router();
const ctrl   = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth');

router.use(authenticate);

router.get('/',                 ctrl.getAll);
router.get('/unread-count',     ctrl.unreadCount);
router.patch('/read-all',       ctrl.markAllRead);
router.patch('/:id/read',       ctrl.markRead);
router.delete('/:id',           ctrl.remove);
router.post('/subscribe',       ctrl.subscribe);
router.delete('/unsubscribe',   ctrl.unsubscribe);

module.exports = router;
