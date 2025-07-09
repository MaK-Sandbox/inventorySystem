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
      CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY,
      item_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (item_id) REFERENCES items(id)
    );

    CREATE TABLE IF NOT EXISTS urls (
      id INTEGER PRIMARY KEY,
      item_id INTEGER NOT NULL,
      url TEXT NOT NULL,
      description TEXT,
      FOREIGN KEY (item_id) REFERENCES items(id)
    );

    CREATE TABLE IF NOT EXISTS currencies (
      id INTEGER PRIMARY KEY,
      name TEXT DEFAULT 'Euro',
      decimal_position INTEGER DEFAULT 2,
      iso_4217_code TEXT UNIQUE DEFAULT 'EUR',
      symbol TEXT DEFAULT '€'
    );

    INSERT INTO currencies (id, name, iso_4217_code, symbol) VALUES (1, 'Euro', 'EUR', '€');
    
    ALTER TABLE items RENAME TO items_old;

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      location_id INTEGER,
      purchase_price INTEGER,
      currency_id INTEGER,
      purchase_date TIMESTAMP,
      freeText TEXT,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (currency_id) REFERENCES currencies(id)
    );

    INSERT INTO items (
      id, name, quantity, location_id, purchase_price, purchase_date, freeText, currency_id
    ) 
    SELECT 
      id, name, quantity, location_id, purchase_price, purchase_date, freeText, 1
    FROM items_old;

    PRAGMA foreign_keys = OFF;

    DROP TABLE items_old;

    PRAGMA foreign_keys = ON;
    
  `);
