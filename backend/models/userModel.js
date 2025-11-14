const db = require("../config/db");
const bcrypt = require("bcryptjs");

// 🔹 Create new user (with location)
const createUser = async (name, email, password, role, location) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO users (name, email, password, role, location)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, email, hashedPassword, role, location], (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
};

// 🔹 Find user by email
const findUserByEmail = (email) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
      if (err) reject(err);
      else resolve(results[0]);
    });
  });
};

module.exports = { createUser, findUserByEmail };
