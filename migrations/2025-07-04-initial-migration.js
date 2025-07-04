// This file creates the initial db file and populates it with the tables as defined in our
// database-design.dbml
// We are only concerned with creating our tables for now, not with DROPping them.

if (!process.env.DB_FILE) {
  console.error("DB_FILE entry missing in environment");
  process.exit(1);
}

import Database from "better-sqlite3";
const db = new Database(process.env.DB_FILE);
db.pragma("foreign_keys = ON");

if (process.env.DEV_MODE) {
  console.log("Creating tables");
}
db.exec(/* sql */ `
      CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      parent_id INTEGER,
      description TEXT,
      FOREIGN KEY (parent_id) REFERENCES locations(id)
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      location_id INTEGER,
      purchase_price INTEGER,
      purchase_date TIMESTAMP,
      receipt BLOB,
      freeText TEXT,
      FOREIGN KEY (location_id) REFERENCES locations(id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS item_tags (
      item_id INTEGER,
      tag_id INTEGER,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (tag_id) REFERENCES tags(id)
    );

    CREATE TABLE IF NOT EXISTS roles (
      id INTEGER PRIMARY KEY,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      FOREIGN KEY (role) REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY,
      token TEXT NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      user_id INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
