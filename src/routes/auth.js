const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const checkAuth = require('../middlewares/check-auth');

router.post('/registration', authController.registration);

router.post('/login', authController.logIn);

router.post('/refresh-token', authController.refreshToken);

router.patch('/password', checkAuth, authController.changePassword);

module.exports = router;
