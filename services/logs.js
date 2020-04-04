'use strict'

function save(text) {
    return new Promise((resolve, reject) => {
        if (typeof(text) != 'string') 
            text = JSON.stringify(text);
        try {
            const path = require('path');
            const fs   = require('fs');
            const date = new Date();
            const dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate() + '.txt';
            const time = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
            const file = path.resolve(__dirname, '../log/errors/' + dateStr);
            if (fs.existsSync(file)) {
                fs.appendFileSync(file, time + ': ' + text + '\n');
            } else {
                fs.writeFileSync(file, time + ': ' + text + '\n');
            }   
            resolve();
        } catch (err) {
            reject(err);
        }
    })
}

module.exports = {
    save: save
};