const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

router.get('/:userId', usersController.userGet);

router.get('/:userId/posts', usersController.userGetPosts);

router.get('/:userId/subscriptions', usersController.userGetSubscriptions);

router.get('/:userId/subscribers', usersController.userGetSubscribers);

module.exports = router;
