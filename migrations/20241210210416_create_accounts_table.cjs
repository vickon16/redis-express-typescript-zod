exports.up = function (knex) {
  return knex.schema.createTable("accounts", (table) => {
    table.increments("id").primary();
    table
      .integer("userId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.string("accountNumber").unique().notNullable();
    table.string("accountName", 255).notNullable();
    table.string("bankName", 255).notNullable();
    table.string("email").notNullable();
    table.string("bankCode").notNullable();
    table.decimal("balance", 15, 2).defaultTo(0);
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("accounts");
};
