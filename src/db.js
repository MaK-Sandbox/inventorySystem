import Database from "better-sqlite3";

let db;

if (!db) {
  db = new Database("../inventory.sqlite");
}

export default db;
