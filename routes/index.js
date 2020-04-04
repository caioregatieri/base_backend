const express = require('express');
const router = express.Router();

router.use('/account', require('./account'));

router.use('/testes',  require('./testes'));

router.use('/users',   require('./users'));

module.exports = router;