const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const requestRoutes = require("./routes/requestRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
 
const workerRoutes = require("./routes/workerRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const notificationsRoutes = require("./routes/notificationsRoutes");


const workerNotifRoutes = require("./routes/notificationsRoutes");
const updateWorkerRoutes = require("./routes/workerRoutes");



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/uploads", express.static("uploads"));

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes); 
app.use("/api/worker", workerRoutes);
app.use("/api/notifications", notificationsRoutes);



app.use("/api/worker_notifications", workerNotifRoutes);

app.use("/api/workers", updateWorkerRoutes);



// Default route
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
});

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
