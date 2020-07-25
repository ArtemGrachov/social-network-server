const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
const checkAuth = require('../middlewares/check-auth');

router.post('', checkAuth, commentsController.commentCreate);

module.exports = router;
