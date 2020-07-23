const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const checkAuth = require('../middlewares/check-auth');

router.post('', checkAuth, postsController.postCreate);

router.patch('/:postId', checkAuth, postsController.postUpdate);

router.delete('/:postId', checkAuth, postsController.postDelete);

module.exports = router;
