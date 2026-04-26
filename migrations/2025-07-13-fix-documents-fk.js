// Recreates the documents table to fix a broken foreign key reference
// that pointed to "items_old" instead of "items".

if (!process.env.DB_FILE) {
  console.error("DB_FILE entry missing in environment");
  process.exit(1);
}

import Database from "better-sqlite3";
const db = new Database(process.env.DB_FILE);
db.pragma("foreign_keys = OFF");

db.exec(`
  BEGIN TRANSACTION;

  CREATE TABLE IF NOT EXISTS documents_fixed (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    description TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
  );

  INSERT INTO documents_fixed SELECT * FROM documents;
  DROP TABLE documents;
  ALTER TABLE documents_fixed RENAME TO documents;

  COMMIT;
`);

console.log("documents FK fixed.");
