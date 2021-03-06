'use strict'

const express = require('express');
const router = express.Router();

const controller = require('../controllers/auth');

router.post('/signup',       controller.signupPost);
router.post('/login',        controller.loginPost);
router.post('/forgot',       controller.forgotPost);
router.post('/reset/:token', controller.resetPost);

module.exports = router;