const uuid = require('uuid');

function encryptPassword(password) {
  const bcrypt = require('bcrypt');
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
}

exports.seed =  function(knex, Promise) {
    return knex('users')
      .del()
      .then(() => {
        return knex('users')
          .insert([
            {
              id:           uuid.v4(),
              name:         'Admin',
              email:        'admin@admin.com',
              phone:        '(00) 0000-0000',
              password:     encryptPassword('admin'),
              created_at:   new Date(),
              updated_at:   new Date()
            },
          ]);
      });
};
