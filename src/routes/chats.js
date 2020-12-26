const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const chatsController = require('../controllers/chats');

router.post('/', checkAuth, chatsController.chatCreate);

router.post('/create-if-not-exist', checkAuth, chatsController.chatCreateOrUseExisting);

router.get('/:chatId', checkAuth, chatsController.chatGet);

module.exports = router;
