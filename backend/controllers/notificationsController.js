

const db = require("../config/db");
//http://localhost:5000/api/notifications
const getAdminNotifications = (req, res) => {
  const sql = `
    SELECT n.id, n.type, n.reference_id, n.status, n.created_at,
           f.rating, f.feedback_text,
           r.request_type, r.location,
           u.name AS citizen_name
    FROM notifications n
    LEFT JOIN feedback f ON n.type='feedback' AND n.reference_id=f.id
    LEFT JOIN requests r ON n.type IN ('request','rejected','completed') AND n.reference_id=r.id
    LEFT JOIN users u ON (r.user_id=u.id OR f.user_id=u.id)
    ORDER BY n.created_at DESC
  `;

  db.query(sql, [], (err, notifications) => {
    if(err) return res.status(500).json({ message: "DB error" });

    const countSql = `
      SELECT type, COUNT(*) AS unread_count
      FROM notifications
      WHERE status='unread'
      GROUP BY type
    `;

    db.query(countSql, [], (err2, counts) => {
      if(err2) return res.status(500).json({ message: "DB error on counts" });

      const unreadCounts = {};
      counts.forEach(c => unreadCounts[c.type] = c.unread_count);

      res.json({ notifications, unreadCounts });
    });
  });
};




const markNotificationRead = (req, res) => {
    const { id } = req.params;

    // Mark ANY notification type as read
    const sql = "UPDATE notifications SET status='read' WHERE id=?";
    
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });

        res.json({ message: "Notification marked as read" });
    });
};

module.exports = {
    getAdminNotifications,
    markNotificationRead
};
