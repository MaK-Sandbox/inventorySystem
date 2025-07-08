import express from "express";
import db from "../db.js";

// Create a new express router object
const router = express.Router();

router.get("/", (req, res) => {
  const locations = db.prepare("SELECT * FROM locations").all();
  res.send(locations);
});

router.get("/:id", (req, res) => {
  const id = req.params["id"];

  // Step 1: Check if an item with the given id even exists in the database
  const location = db.prepare("SELECT * FROM locations WHERE id = ?").get(id);

  // If such item does not exist, return an error message back to the user
  if (!location) {
    res
      .status(400)
      .send("An item with the provided id does not exist in the database");
    return;
  }
  res.send(location);
});

router.post("/", (req, res) => {
  // Validate properties
  const allowedProperties = ["name", "parent_id", "description"];

  // Step 1: Check if a request body was provided. If not, return an error message back to the user
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("Provide a body to put request");
    return;
  }

  // Step 2: Validate and filter properties
  const insertData = {};
  for (const key in req.body) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      const value = req.body[key];

      // If an illegal property is detected, return an error message to the user
      if (!allowedProperties.includes(key)) {
        res.status(400).send("Illegal property");
        return;
      }
      insertData[key] = value;
    }
  }

  // Step 3: Use properties of validated entries and values
  const validatedProperties = Object.keys(insertData);
  const validatedValues = Object.values(insertData);

  const insertStatement = db.prepare(
    `INSERT INTO locations (${validatedProperties.join(", ")}) VALUES (?, ?, ?)`
  );

  const info = insertStatement.run(...validatedValues);

  // Assuming that the creation was successful, store the id of the lastest inserted row
  if (info.changes === 0) {
    res.send(403).send("Forbidden");
    return;
  }

  const newLocationId = info.lastInsertRowid;

  // Return the newly created item
  res.json(
    db.prepare("SELECT * FROM locations WHERE id = ?").get(newLocationId)
  );
});

router.put("/:id", (req, res) => {
  const id = req.params.id;

  // Step 1: Check if a location with the given id even exists in the database
  const location = db.prepare("SELECT * FROM locations WHERE id = ?").get(id);

  // If such location does not exist, return an error message back to the user
  if (!location) {
    res
      .status(400)
      .send("A location with the provided id does not exist in the database");
    return;
  }

  // Step 2: Check if a request body was provided. If not, return an error message back to the user
  if (Object.keys(req.body).length === 0) {
    res.status(400).send("Provide a body to put request");
    return;
  }

  // Step 3: Ensure that only allowed properties are processed
  const allowedProperties = ["name", "parent_id", "description"];

  for (const key in req.body) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      const element = req.body[key];

      // If an illegal property is detected, return an error message to the user
      if (!allowedProperties.includes(key)) {
        res.status(400).send("Illegal property");
        return;
      }

      const updateStatement = db.prepare(
        `UPDATE locations SET ${key} = ? WHERE id = ?`
      );
      updateStatement.run(element, id);
    }
  }
  res.json(db.prepare("SELECT * FROM locations WHERE id = ?").get(id));
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;

  // Step 1: Check if an location with the given id even exists in the database
  const location = db.prepare("SELECT * FROM locations WHERE id = ?").get(id);

  // If such location does not exist, return an error message back to the user
  if (!location) {
    res
      .status(400)
      .send("A location with the provided id does not exist in the database");
    return;
  }

  // Step 2: If such location does exist, delete the locaion from the database
  db.prepare("DELETE FROM locations WHERE id = ?").run(id);

  res.status(200).json(location);
});

export default router;
