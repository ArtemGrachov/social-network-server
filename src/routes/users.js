const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

router.get('/:userId', usersController.userGet);

router.get('/:userId/posts', usersController.userGetPosts);

module.exports = router;
