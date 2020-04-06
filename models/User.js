'use strict'
const bookshelf = require('../config/bookshelf').bookshelf;

const Model = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function() {
    this.on('saving', this.hashPassword, this);
  },

  hashPassword: async function(model, attrs, options) {
    const bcrypt = require('bcrypt');
    const { promisify } = require('util');

    const password = options.patch ? attrs.password : model.get('password');
    if (!password) { return; }

    try {
      const genSalt = promisify(bcrypt.genSalt);
      const genHash = promisify(bcrypt.hash);
  
      const salt = await genSalt(10);
      const hash = await genHash(password, salt);

      if (options.patch) {
        attrs.password = hash;
      }

      model.set('password', hash);

      return;
    } catch(error) {
      throw(error);
    }
  },

  comparePassword: function(password, done) {
    const model = this;
    bcrypt.compare(password, model.get('password'), function(err, isMatch) {
      done(err, isMatch);
    });
  },

  hidden: ['password', 'passwordResetToken', 'passwordResetExpires'],

  virtuals: {

  },
});

const Schema = [
  'id',
  'name',
  'phone',
  'email',
  'password',
  'passwordResetToken',
  'passwordResetExpires',
  'created_at',
  'update_at'
];

const PrimaryKey = 'id';

const Relations = [

];

module.exports = {
  Model,
  PrimaryKey,
  Schema,
  Relations
};
