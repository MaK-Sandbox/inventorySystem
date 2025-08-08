import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

let domain;
if (process.env.NODE_ENV === "development") {
  domain = "127.0.0.1";
} else {
  domain = "ser6pro";
}

// Use JSON middleware
app.use(express.json());
app.use(express.static("public"));
app.use(cors());
app.use(fileUpload());

// Import and initialize routers
import itemsRouter from "./routes/Items.js";
import locationsRouter from "./routes/Locations.js";
import searchRouter from "./routes/Search.js";
import documentsRouter from "./routes/Documents.js";

// Use imported routers
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/locations", locationsRouter);
app.use("/search", searchRouter);
app.use("/api/v1/documents", documentsRouter);

app.get("/", (req, res) => {
  res.send("Test route");
});

app.listen(port, () => {
  console.log(`App listening at http://${domain}:${port}`);
});
