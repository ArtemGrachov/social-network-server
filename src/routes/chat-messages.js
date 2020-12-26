const express = require('express');
const router = express.Router();
const chatMessagesController = require('../controllers/chat-messages');
const checkAuth = require('../middlewares/check-auth');

router.patch('/:chatMessageId', checkAuth, chatMessagesController.chatMessageUpdate);

router.delete('/:chatMessageId', checkAuth, chatMessagesController.chatMessageDelete);

module.exports = router;
