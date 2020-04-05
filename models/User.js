'use strict'

const bcrypt = require('bcrypt');
const bookshelf = require('../config/bookshelf').bookshelf;

const Model = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function() {
    this.on('saving', this.hashPassword, this);
  },

  hashPassword: function(model, attrs, options) {
    const password = options.patch ? attrs.password : model.get('password');
    if (!password) { return; }
    return new Promise(function(resolve, reject) {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(password, salt, null, function(err, hash) {
          if (options.patch) {
            attrs.password = hash;
          }
          model.set('password', hash);
          resolve();
        });
      });
    });
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
