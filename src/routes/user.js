const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const checkAuth = require('../middlewares/check-auth');

router.patch('/', checkAuth, userController.userUpdate);

router.post('/subscriptions/users', checkAuth, userController.userSubscribeTo);

router.delete('/subscriptions/users/:subscriptionId', checkAuth, userController.userUnsubscribeFrom);

module.exports = router;
