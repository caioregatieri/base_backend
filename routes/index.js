'use strict'

const express = require('express');
const router = express.Router();

router.use('/auth',   require('./auth'));

router.use('/testes', require('./testes'));

router.use('/users',  require('./users'));

module.exports = router;