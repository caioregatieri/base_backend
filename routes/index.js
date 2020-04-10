'use strict'

const express = require('express');
const fs = require('fs');
const router = express.Router();

fs.readdirSync(__dirname)
    .filter(file => file.split('.')[1] == 'js' && file != 'index.js')
    .forEach(file => {
        const f = file.split('.')[0];
        router.use(`/${f}`, require(`./${f}`))
    });

module.exports = router;