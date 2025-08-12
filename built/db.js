import Database from "better-sqlite3";
if (!process.env.DB_FILE) {
    console.error("DB_FILE entry missing in environment");
    process.exit(1);
}
let db;
if (!db) {
    db = new Database(process.env.DB_FILE);
    db.pragma("foreign_keys = ON");
}
export default db;
