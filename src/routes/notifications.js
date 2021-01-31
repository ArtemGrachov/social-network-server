const express = require('express');
const router = express.Router();
const notificationsController = require('../controllers/notifications');
const checkAuth = require('../middlewares/check-auth');

router.get('', checkAuth, notificationsController.getNotifications);

module.exports = router;
