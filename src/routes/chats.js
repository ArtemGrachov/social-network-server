const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const chatsController = require('../controllers/chats');

router.post('/', checkAuth, chatsController.chatCreate);

module.exports = router;
