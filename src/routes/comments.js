const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
const checkAuth = require('../middlewares/check-auth');

router.post('', checkAuth, commentsController.commentCreate);

router.patch('/:commentId', checkAuth, commentsController.commentUpdate);

router.delete('/:commentId', checkAuth, commentsController.commentDelete);

router.post('/:commentId/likes', checkAuth, commentsController.commentAddLike);

router.delete('/:commentId/likes', checkAuth, commentsController.commentDeleteLike);

module.exports = router;
