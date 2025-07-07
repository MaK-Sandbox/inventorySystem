import express from "express";
import db from "../db.js";

// Create a new express router object
const router = express.Router();

router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM items");
  const info = stmt.all();
  res.send(info);
});

export default router;
