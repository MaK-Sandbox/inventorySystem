import express from "express";
import db from "./db.js";

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM items");
  const info = stmt.all();
  console.log(info);
  res.send(info);
});

app.listen(port, () => {
  console.log(`App listening at http://127.0.0.1:${port}`);
});
