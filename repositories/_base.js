'use strict'
const { knex } = require('../config/bookshelf');

class BaseRepository {

    constructor(model) {
        const { Model, Schema, Relations, Primarykey } = model;
        this.Model = Model;
        this.Schema = Schema;
        this.Relations = Relations;
        this.Primarykey = Primarykey;
    }

    async helloWord() {
        return 'Hello world';
    }
}

module.exports = BaseRepository;
