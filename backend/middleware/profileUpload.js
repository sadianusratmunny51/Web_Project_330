const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = "uploads/profile";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const uploadProfile = multer({ storage });

module.exports = uploadProfile;
