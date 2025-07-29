import express from "express";
import db from "../db.js";

// Create a new express router object
const router = express.Router();

router.get("/", (req, res) => {
  const query = req.query;
  res.json(query);
});

export default router;
