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

router.post("/", (req, res) => {
  const name = req.body["name"];
  const quantity = req.body["quantity"];
  const locationId = req.body["location_id"];
  const purchasePrice = req.body["purchase_price"];
  const purchaseDate = req.body["purchase_date"];
  const receipt = req.body["receipt"];
  const freeText = req.body["freeText"];

  const insertStatement = db.prepare(
    "INSERT INTO items (name, quantity, location_id, purchase_price, purchase_date, receipt, freeText) VALUES (?, ?, ?, ?, ?, ?, ?)"
  );

  const info = insertStatement.run(
    name,
    quantity,
    locationId,
    purchasePrice,
    purchaseDate,
    receipt,
    freeText
  );

  // Assuming that the creation was successful, store the id of the lastest inserted row

  if (info.changes === 0) {
    res.send(403).send("Forbidden");
    return;
  }

  const newEmployeeId = info.lastInsertRowid;

  // Return the newly created item
  res.json(db.prepare("SELECT * FROM items WHERE id = ?").get(newEmployeeId));
});

router.put("/:id", (req, res) => {
  const id = req.params.id;

  if (Object.keys(req.body).length === 0) {
    res.status(400).send("Provide a body to put request");
    return;
  }

  const allowedProperties = [
    "id",
    "name",
    "quantity",
    "location_id",
    "purchase_price",
    "purchase_date",
    "receipt",
    "freeText",
  ];

  for (const key in req.body) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      const element = req.body[key];

      if (!allowedProperties.includes(key)) {
        res.status(400).send("Illegal property");
        return;
      }

      const updateStatement = db.prepare(
        `UPDATE items SET ${key} = ? WHERE id = ?`
      );
      updateStatement.run(element, id);
    }
  }

  res.json(db.prepare("SELECT * FROM items WHERE id = ?").get(id));
});

export default router;
