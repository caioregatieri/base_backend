function encryptPassword(password) {
  var bcrypt = require('bcrypt');
  var salt = bcrypt.genSaltSync(10);
  var hash = bcrypt.hashSync(password, salt);
  return hash;
}

exports.seed =  function(knex, Promise) {
    return knex('users')
      .del()
      .then(() => {
        return knex('users')
          .insert([
            {
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
