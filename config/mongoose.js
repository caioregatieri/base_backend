'use strict'

const mongoose = require('mongoose');

const url  = process.env.MONGO_URL;
const user = process.env.MONGO_USER;
const pass = process.env.MONGO_PASSWORD;
const host = process.env.MONGO_HOST || '127.0.0.1';
const port = process.env.MONGO_PORT || 27017;
const name = process.env.MONGO_DB_NAME;

let dns;
if (url) {
    dns = url;
} else if (user && pass) {
    dns = `mongodb://${user}:${pass}@${host}:${port}/${name}`;
} else {
    dns = `mongodb://${host}:${port}/${name}`;
}

mongoose.connect(dns, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;