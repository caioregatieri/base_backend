'use strict'

const config = require('../knexfile');
const knex = require('knex')(config);
const bookshelf = require('bookshelf')(knex);

bookshelf.plugin('virtuals');
bookshelf.plugin('visibility');
bookshelf.plugin('pagination');
bookshelf.plugin(require('bookshelf-eloquent')); // https://www.npmjs.com/package/bookshelf-eloquent

knex.migrate.latest();

module.exports = {
    bookshelf,
    knex
};
