exports.up = function (knex) {
  return knex.schema.createTable("transactions", (table) => {
    table.increments("id").primary();
    table
      .integer("accountId")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("accounts")
      .onDelete("CASCADE")
      .onUpdate("CASCADE");

    table.enum("type", ["debit", "credit"]).notNullable(); // Debit or Credit transaction
    table.decimal("amount", 15, 2).notNullable();
    table.string("description", 255).notNullable();
    table
      .string("status", ["pending", "completed", "failed"])
      .defaultTo("pending")
      .notNullable();
    table.string("reference").notNullable();
    table.timestamps(true, true); // Adds created_at and updated_at columns
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("transactions");
};
