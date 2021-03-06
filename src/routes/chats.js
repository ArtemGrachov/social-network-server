const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/check-auth');
const chatsController = require('../controllers/chats');

router.post('/', checkAuth, chatsController.chatCreate);

router.post('/private', checkAuth, chatsController.chatFindPrivate);

router.post('/create-if-not-exist', checkAuth, chatsController.chatCreateOrUseExisting);

router.get('/:chatId', checkAuth, chatsController.chatGet);

router.get('/', checkAuth, chatsController.chatsGet);

router.post('/:chatId/messages', checkAuth, chatsController.chatMessageCreate);

router.get('/:chatId/messages', checkAuth, chatsController.chatMessagesGet);

module.exports = router;
