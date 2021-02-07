const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const checkAuth = require('../middlewares/check-auth');

router.post('', checkAuth, postsController.postCreate);

router.patch('/:postId', checkAuth, postsController.postUpdate);

router.delete('/:postId', checkAuth, postsController.postDelete);

router.post('/:postId/likes', checkAuth, postsController.postAddLike);

router.delete('/:postId/likes', checkAuth, postsController.postDeleteLike);

router.get('/:postId/comments', postsController.postGetComments);

router.get('/:postId', postsController.postGet);

module.exports = router;
