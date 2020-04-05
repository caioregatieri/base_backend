'use strict'

const fs = require('fs');
const multer = require('multer');
const path = require('path');
const shell = require('shelljs');

module.exports = function(pathtoSave){
    const crypto = require("crypto");
    const storage = multer.diskStorage({
        destination: function(req, file, cb){
            const _pathtoSave = path.join(pathtoSave, crypto.randomBytes(20).toString('hex'));
            if (!fs.existsSync(_pathtoSave)) shell.mkdir('-p', _pathtoSave);
            cb(null, _pathtoSave);
        },
        filename: function(req, file, cb){
            const fileName = `${Date.now()}${path.extname(file.originalname)}`;
            cb(null, fileName);
        }
    });
    return  multer({ storage });
};

