// server.js
import express from "express"; 
const app = express();

// Middleware
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// Port
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
