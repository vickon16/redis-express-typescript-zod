import knex from "knex";
import knexConfig from "../../knexfile.cjs";

const db = knex(knexConfig.development);

export default db;

// npx knex migrate:make create_users_table
