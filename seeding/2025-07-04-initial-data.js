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

db.exec(/* sql */ `
-- Insert roles
INSERT INTO roles (id, role) VALUES
  (1, 'admin'),
  (2, 'user');

-- Insert users
INSERT INTO users (id, name, email, role) VALUES
  (1, 'Alice Admin', 'alice@example.com', 1),
  (2, 'Bob User', 'bob@example.com', 2);

-- Insert locations
INSERT INTO locations (id, name, parent_id, description) VALUES
  (1, 'Denmark', NULL, 'Padborg'),
  (2, 'Germany', NULL, 'Düsseldorf'),
  (3, 'Apartment', 1, 'Stored in apartment'),
  (4, 'Apartment', 2, 'Stored in apartment'),
  (5, 'Storage room', 2, 'Stored in Annes storage room'),
  (6, 'Shoe box A1', 3, 'Stored in the bedroom'),
  (7, 'Shoe box A1', 4, 'Stored in the office'),
  (8, 'Shoe box B1', 4, 'Stored in the office'),
  (9, 'Shelf A', 5, 'First shelf in storage room'),
  (10, 'Shelf B', 5, 'Second shelf in storage room');

-- Insert items
INSERT INTO items (id, name, quantity, location_id, purchase_price, purchase_date, receipt, freeText) VALUES
  (1, 'Laptop', 5, 2, 1200, '2024-05-15 10:00:00', '89504E470D0A1A0A', 'Office equipment'),
  (2, 'Monitor', 3, 2, 300, '2024-06-01 12:30:00', '89504E470D0A1A0A', 'Office display'),
  (3, 'Keyboard', 10, 2, 50, '2024-06-10 09:00:00', NULL, 'Input device');

-- Insert tags
INSERT INTO tags (id, name) VALUES
  (1, 'electronics'),
  (2, 'office'),
  (3, 'peripheral');

-- Insert item_tags
INSERT INTO item_tags (item_id, tag_id) VALUES
  (1, 1),  -- Laptop → electronics
  (1, 2),  -- Laptop → office
  (2, 1),  -- Monitor → electronics
  (2, 2),  -- Monitor → office
  (3, 3);  -- Keyboard → peripheral

-- Insert sessions
INSERT INTO sessions (id, token, expires_at, user_id) VALUES
  (1, 'abc123token', '2025-08-01 00:00:00', 1),
  (2, 'def456token', '2025-08-01 00:00:00', 2);
  `);
