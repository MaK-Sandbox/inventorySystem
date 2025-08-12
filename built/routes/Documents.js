import express from "express";
import db from "../db.js";
import fs from "fs/promises";
import path from "path";
// Create a new express router object
const router = express.Router();
router.get("/", (req, res) => {
    const documents = db.prepare("SELECT * FROM documents").all();
    res.json(documents);
});
router.post("/upload", async (req, res) => {
    const files = Array.isArray(req.files.file)
        ? req.files.file
        : [req.files.file];
    const documentPath = path.join(process.env.DOC_DIR, files[0].name);
    const data = files[0].data;
    await fs.writeFile(documentPath, data);
    res.json({ msg: "OK" });
});
export default router;
