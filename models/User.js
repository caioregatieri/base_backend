'use strict'
const bookshelf = require('../config/bookshelf').bookshelf;

const { encrypt } = require('../utils/encryptText');
const { make: uuid } = require('../utils/uuid');

const Model = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  initialize: function() {
    this.on('saving', this.onSaving, this);
  },

  onSaving: async function(model, attrs, options) {
    const password = options.patch ? attrs.password : model.get('password');
    if (!password) { return; }

    try {
      const hash = encrypt(password);

      if (options.patch) {
        attrs.password = hash;
      } else {
        model.set('id', uuid());
      }

      model.set('password', hash);
    } catch(error) {
      throw(error);
    }
  },

  comparePassword: function(password, done) {
    const bcrypt = require('bcrypt');
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
