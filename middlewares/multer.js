'use strict'

const fs = require('fs');
const multer = require('multer');
const path = require('path');
const shell = require('shelljs');

module.exports = function(pathtoSave){
    var crypto = require("crypto");
    var random = crypto.randomBytes(20).toString('hex');
    const storage = multer.diskStorage({
        destination: function(req, file, cb){
            const _pathtoSave = path.join(pathtoSave, random);
            if (!fs.existsSync(_pathtoSave)) shell.mkdir('-p', _pathtoSave);
            cb(null, _pathtoSave);
        },
        filename: function(req, file, cb){
            const fileName = `${random}${Date.now()}${path.extname(file.originalname)}`;
            cb(null, fileName);
        }
    });
    return  multer({ storage });
};

