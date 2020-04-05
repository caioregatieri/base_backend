exports.up = function(knex) {
  return Promise.all([
    knex.schema.createTable('users', function(table) {
      table.increments().primary();
      table.string('name');
      table.string('phone');
      table.string('email').unique();
      table.string('password');
      table.string('passwordResetToken');
      table.dateTime('passwordResetExpires');
      table.timestamps();
    })
  ]);
};

exports.down = function(knex) {
  return Promise.all([
    knex.schema.dropTable('users')
  ]);
};
