import express from "express";
import db from "../db.js";

// Create a new express router object
const router = express.Router();

router.get("/", (req, res) => {
  const documents = db.prepare("SELECT * FROM documents").all();
  res.json(documents);
});

export default router;
