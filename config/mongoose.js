'use strict'

const mongoose = require('mongoose');

const url  = process.env.MONGODB_URL;
const user = process.env.MONGODB_USER;
const pass = process.env.MONGODB_PASSWORD;
const host = process.env.MONGODB_HOST;
const port = process.env.MONGODB_PORT || 27017;
const name = process.env.MONGODB_NAME;

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