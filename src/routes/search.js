const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

router.post('/users', searchController.searchUser);

router.post('/posts', searchController.searchPost);

module.exports = router;
