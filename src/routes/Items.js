import express from "express";
import db from "../db.js";

// Create a new express router object
const router = express.Router();

router.get("/", (req, res) => {
  const stmt = db.prepare("SELECT * FROM items");
  const items = stmt.all();
  res.send(items);
});

router.get("/:id", (req, res) => {
  const id = req.params["id"];

  const stmt = db.prepare("SELECT * FROM items WHERE id = ?");
  const item = stmt.get(id);

  res.send(item);
});

export default router;
