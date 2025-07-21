import express from "express";
import cors from "cors";

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Use JSON middleware
app.use(express.json());
app.use(express.static("public"));
app.use(cors());

// Import and initialize routers
import itemsRouter from "./routes/Items.js";
import locationsRouter from "./routes/Locations.js";

// Use imported routers
app.use("/api/v1/items", itemsRouter);
app.use("/api/v1/locations", locationsRouter);

app.get("/", (req, res) => {
  res.send("Test route");
});

app.listen(port, () => {
  console.log(`App listening at http://127.0.0.1:${port}`);
});
