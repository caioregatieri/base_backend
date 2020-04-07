const { encrypt } = require('../../utils/encryptText');
const { make: uuid } = require('../../utils/uuid');

exports.seed = async function(knex) {
    await knex('users').del();
    await knex('users').insert([
      {
        id:           uuid(),
        name:         'Admin',
        email:        'admin@admin.com',
        phone:        '(00) 0000-0000',
        password:     encrypt('admin'),
        created_at:   new Date(),
        updated_at:   new Date()
      },
    ]);
};
