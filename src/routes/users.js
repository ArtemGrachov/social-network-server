const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');

router.get('/:userId', usersController.userGet);

module.exports = router;
