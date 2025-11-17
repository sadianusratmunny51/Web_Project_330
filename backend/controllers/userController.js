const db = require("../config/db");


// update profile
const updateProfile = (req, res) => {
  const user_id = req.user.id;
  const { name, email, phone, location } = req.body;

  if (!name || !email || !location) {
    return res.status(400).json({ message: "Name, Email & Address are required" });
  }

  const sql = `
    UPDATE users 
    SET name = ?, email = ?, phone = ?, location = ?
    WHERE id = ?
  `;

  db.query(sql, [name, email, phone, location, user_id], (err, result) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Email already exists" });
      }
      return res.status(500).json({ message: "Database error", error: err });
    }

    res.json({ message: "Profile updated successfully" });
  });
};

// Get reward point)
const getUserRewards = (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT waste_reward_points, recycled_reward_points
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      waste_reward_points: result[0].waste_reward_points,
      recycled_reward_points: result[0].recycled_reward_points
    });
  });
};


//return total reward points
const getTotalRewards = (req, res) => {
  const user_id = req.user.id;

  const sql = `
    SELECT 
      (waste_reward_points + recycled_reward_points) AS total_reward_points
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      total_reward_points: result[0].total_reward_points
    });
  });
};

module.exports = { getUserRewards, getTotalRewards, updateProfile };

