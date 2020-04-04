'use strict'

const fs = require('fs');
const unzip = require('unzip');

function extract(file, output) {
    fs.createReadStream(file).pipe(unzip.Extract({ path: output }));
}

module.exports = { 
    extract 
};