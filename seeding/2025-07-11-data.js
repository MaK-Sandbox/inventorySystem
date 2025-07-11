if (!process.env.DB_FILE) {
  console.error("DB_FILE entry missing in environment");
  process.exit(1);
}

import Database from "better-sqlite3";
const db = new Database(process.env.DB_FILE);
db.pragma("foreign_keys = ON");

if (process.env.DEV_MODE) {
  console.log("Seeding tables");
}

// Insert roles
db.exec(/* sql */ `
  INSERT INTO roles (role) VALUES
    ('admin'),
    ('user');
`);

// Insert users
db.exec(/* sql */ `
  INSERT INTO users (name, email, role) VALUES
    ('Alice Admin', 'alice@example.com', 1),
    ('Bob User', 'bob@example.com', 2);
`);

// Insert locations
db.exec(/* sql */ `
  INSERT INTO locations (name, parent_id, description) VALUES
    ('Denmark', NULL, 'Padborg'),
    ('Germany', NULL, 'Düsseldorf'),
    ('Apartment', 1, 'Stored in apartment'),
    ('Apartment', 2, 'Stored in apartment'),
    ('Storage room', 2, 'Stored in Annes storage room'),
    ('Shoe box A1', 3, 'Stored in the bedroom'),
    ('Shoe box A1', 4, 'Stored in the office'),
    ('Shoe box B1', 4, 'Stored in the office'),
    ('Shelf A', 5, 'First shelf in storage room'),
    ('Shelf B', 5, 'Second shelf in storage room');
`);

// Insert items
db.exec(/* sql */ `
  INSERT INTO items (name, quantity, location_id, purchase_price, currency_id, purchase_date, freeText) VALUES
    ('Laptop', 5, 2, 1200, 1, '2024-05-15 10:00:00', 'Office equipment'),
    ('Monitor', 3, 2, 300, 1, '2024-06-01 12:30:00', 'Office display'),
    ('Keyboard', 10, 2, 50, 1, '2024-06-10 09:00:00', 'Input device');
`);

// Insert tags
db.exec(/* sql */ `
  INSERT INTO tags (name) VALUES
    ('electronics'),
    ('office'),
    ('peripheral');
`);

// Insert sessions
db.exec(/* sql */ `
  INSERT INTO sessions (token, expires_at, user_id) VALUES
    ('abc123token', '2025-08-01 00:00:00', 1),
    ('def456token', '2025-08-01 00:00:00', 2);
`);

// Insert documents
db.exec(/* sql */ `
  INSERT INTO documents (item_id, path, description) VALUES
    (1, 'path1', 'Just a test path'),
    (1, 'path2', 'Just a test path');
`);

// Insert urls
db.exec(/* sql */ `
  INSERT INTO urls (item_id, url, description) VALUES
    (1, 'some url', 'Just a test url'),
    (1, 'some other url', 'Just a test url');
`);

// Uncomment if you want to insert item_tags later
db.exec(/* sql */ `
  INSERT INTO item_tags (item_id, tag_id) VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 2),
    (3, 3);
`);
