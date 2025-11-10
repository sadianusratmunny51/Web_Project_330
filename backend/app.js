// server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");

dotenv.config();

const app = express();
app.use(cors())
// Middleware
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
