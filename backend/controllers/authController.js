const db = require("../config/db");
const { createUser, findUserByEmail } = require("../models/userModel");
const { generateToken } = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

// Register User
const registerUser = async (req, res) => {
  const { name, email, password, role, location } = req.body;

  try {
  
    if (!name || !email || !password || !role || !location) {
      return res.status(400).json({ message: "All fields including location are required" });
    }

    // Check existing user
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create user
    await createUser(name, email, password, role, location);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Update Profile Picture
const updateProfilePic = (req, res) => {
  const user_id = req.user.id;
  const profile_image = req.file.filename; // multer saves file info in req.file

  const sql = `UPDATE users SET profile_image = ? WHERE id = ?`;
  db.query(sql, [profile_image, user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error", error: err });
    res.json({ message: "Profile picture updated", profile_image });
  });
};



module.exports = { registerUser, loginUser, updateProfilePic };