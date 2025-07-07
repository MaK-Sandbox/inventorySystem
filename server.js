import express from "express";

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening at http://127.0.0.1:${port}`);
});
