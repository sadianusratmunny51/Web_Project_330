const db = require("../config/db");
const { createUser, findUserByEmail } = require("../models/userModel");
const { generateToken } = require("../utils/generateToken");
const bcrypt = require("bcryptjs");
const { generateOTP } = require("../utils/otpGenerator");
const { sendEmail } = require("../utils/sendEmail");

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


// DELETE own account
const deleteMyAccount = (req, res) => {
  const user_id = req.user.id; // from token

  const sql = `DELETE FROM users WHERE id = ?`;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Account deleted successfully" });
  });
};


// Forget password - SEND OTP
const forgotPassword = (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  // Check user exists
  const checkSql = `SELECT * FROM users WHERE email = ?`;

  db.query(checkSql, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: err });

    if (result.length === 0) {
      return res.status(404).json({ message: "No account found with this email" });
    }

    const otp = generateOTP();
    const expires_at = new Date(Date.now() + 10 * 60000); // 10 minutes expiry

    // Insert OTP into table
    const insertSql = `
      INSERT INTO password_resets (email, otp, expires_at)
      VALUES (?, ?, ?)
    `;

    db.query(insertSql, [email, otp, expires_at], async (err2) => {
      if (err2) return res.status(500).json({ error: err2 });

      // Send OTP via Email
      await sendEmail(email, "Your Password Reset OTP", `Your OTP is: ${otp}`);

      res.json({ message: "OTP sent to your email" });
    });
  });
};


module.exports = { registerUser, loginUser, updateProfilePic, deleteMyAccount, forgotPassword};