// This file creates the tables needed for documents and urls as defined in our database-design.dbml
// We are only concerned with creating our tables for now, not with populating them with data.

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
    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT DEFAULT 'Euro',
      decimal_position INTEGER DEFAULT 2,
      iso_4217_code TEXT UNIQUE DEFAULT 'EUR',
      symbol TEXT DEFAULT '€'
    );

    INSERT INTO currencies (id, name, iso_4217_code, symbol) VALUES (1, 'Euro', 'EUR', '€');

    PRAGMA foreign_keys=off;

    -- === Step 1: Create new tables with temporary names ===

    -- items_new
    CREATE TABLE items_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR NOT NULL,
      quantity INTEGER NOT NULL,
      location_id INTEGER,
      purchase_price INTEGER,
      currency_id INTEGER NOT NULL,
      purchase_date TIMESTAMP,
      freeText VARCHAR,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id)
    );

    -- locations_new
    CREATE TABLE locations_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR NOT NULL,
      parent_id INTEGER,
      description VARCHAR,
      FOREIGN KEY (parent_id) REFERENCES locations(id)
    );

    -- tags_new
    CREATE TABLE tags_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR NOT NULL
    );

    -- item_tags_new
    CREATE TABLE item_tags_new (
      item_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (item_id, tag_id),
      FOREIGN KEY (item_id) REFERENCES items(id),
      FOREIGN KEY (tag_id) REFERENCES tags(id)
    );

    -- === Step 2: Copy data from old tables ===

    INSERT INTO items_new (id, name, quantity, location_id, purchase_price, currency_id, purchase_date, freeText)
    SELECT id, name, quantity, location_id, purchase_price, 1, purchase_date, freeText FROM items;

    INSERT INTO locations_new (id, name, parent_id, description)
    SELECT id, name, parent_id, description FROM locations;

    INSERT INTO tags_new (id, name)
    SELECT id, name FROM tags;

    INSERT INTO item_tags_new (item_id, tag_id)
    SELECT item_id, tag_id FROM item_tags;

    -- === Step 3: Drop old tables ===

    DROP TABLE items;
    DROP TABLE locations;
    DROP TABLE tags;
    DROP TABLE item_tags;

    -- === Step 4: Rename new tables to original names ===

    ALTER TABLE items_new RENAME TO items;
    ALTER TABLE locations_new RENAME TO locations;
    ALTER TABLE tags_new RENAME TO tags;
    ALTER TABLE item_tags_new RENAME TO item_tags;

    PRAGMA foreign_keys=on;

    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (item_id) REFERENCES items(id)
    );

    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (item_id) REFERENCES items(id)
    );
  `);
