import express from "express";
import db from "../db.js";
import fs from "fs/promises";
import path from "path";
import type { UploadedFile } from "express-fileupload";

const router = express.Router();

interface DocumentRow {
  id: number;
  item_id: number;
  path: string;
  description: string | null;
}

function docDir(): string {
  const dir = process.env.DOC_DIR;
  if (!dir) throw new Error("DOC_DIR environment variable is not set");
  return dir;
}

// GET /api/v1/documents/item/:itemId — list documents for an item
router.get("/item/:itemId", (req, res) => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) {
    res.status(400).json({ error: "Invalid item ID" });
    return;
  }

  const docs = db
    .prepare("SELECT * FROM documents WHERE item_id = ? ORDER BY id ASC")
    .all(itemId) as DocumentRow[];

  res.json(docs.map((d) => ({ ...d, name: path.basename(d.path) })));
});

// POST /api/v1/documents/item/:itemId — upload one or more files for an item
router.post("/item/:itemId", async (req, res) => {
  const itemId = parseInt(req.params.itemId);
  if (isNaN(itemId)) {
    res.status(400).json({ error: "Invalid item ID" });
    return;
  }

  const item = db
    .prepare("SELECT id, name FROM items WHERE id = ?")
    .get(itemId) as { id: number; name: string } | undefined;
  if (!item) {
    res.status(404).json({ error: "Item not found" });
    return;
  }

  if (!req.files?.files) {
    res.status(400).json({ error: "No files provided" });
    return;
  }

  const uploaded: UploadedFile[] = Array.isArray(req.files.files)
    ? req.files.files
    : [req.files.files as UploadedFile];

  const nameSlug = item.name.toLowerCase().replace(/ /g, "-").slice(0, 48);
  const dir = path.join(docDir(), `${itemId}_${nameSlug}`);
  console.log(dir);
  await fs.mkdir(dir, { recursive: true });

  const insert = db.prepare(
    "INSERT INTO documents (item_id, path, description) VALUES (?, ?, ?)",
  );

  const created = [];
  for (const file of uploaded) {
    const safeName = path.basename(file.name);
    const filePath = path.join(dir, safeName);
    await file.mv(filePath);
    const info = insert.run(itemId, filePath, null);
    created.push({
      id: Number(info.lastInsertRowid),
      item_id: itemId,
      path: filePath,
      name: safeName,
      description: null,
    });
  }

  res.status(201).json(created);
});

// GET /api/v1/documents/:docId/download — stream file to client
router.get("/:docId/download", (req, res) => {
  const docId = parseInt(req.params.docId);
  if (isNaN(docId)) {
    res.status(400).json({ error: "Invalid document ID" });
    return;
  }

  const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(docId) as
    | DocumentRow
    | undefined;
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  res.download(doc.path, path.basename(doc.path));
});

// DELETE /api/v1/documents/:docId — delete file + DB record
router.delete("/:docId", async (req, res) => {
  const docId = parseInt(req.params.docId);
  if (isNaN(docId)) {
    res.status(400).json({ error: "Invalid document ID" });
    return;
  }

  const doc = db.prepare("SELECT * FROM documents WHERE id = ?").get(docId) as
    | DocumentRow
    | undefined;
  if (!doc) {
    res.status(404).json({ error: "Document not found" });
    return;
  }

  await fs.unlink(doc.path).catch(() => {});
  db.prepare("DELETE FROM documents WHERE id = ?").run(docId);
  res.json({ deleted: docId });
});

export default router;
