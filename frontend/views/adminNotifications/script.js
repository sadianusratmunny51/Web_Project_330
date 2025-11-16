const NOTIF_URL = "http://localhost:5000/api/notifications";
let notifications = []; // store all notifications

// Load notifications and update counters
async function loadNotifications() {
  const response = await fetch(NOTIF_URL, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });

  const result = await response.json();

  // Store all notifications
  notifications = result.notifications || [];

  // Unread counter object
  const unreadCounts = result.unreadCounts || {};

  // Set category counters
  document.getElementById("newReqCount").innerText = unreadCounts.request || 0;
  document.getElementById("feedbackCount").innerText = unreadCounts.feedback || 0;
  document.getElementById("rejectedCount").innerText = unreadCounts.rejected || 0;
  document.getElementById("completedCount").innerText = unreadCounts.completed || 0;

  // Total sidebar count
  const totalUnread =
    (unreadCounts.request || 0) +
    (unreadCounts.feedback || 0) +
    (unreadCounts.rejected || 0) +
    (unreadCounts.completed || 0);

  document.getElementById("notifCount").innerText = totalUnread;
}


// Display selected category list and mark unread → read
function displayCategory(type, containerId, countId) {

  const container = document.getElementById(containerId);
  container.innerHTML = ""; // clear previous

  // Filter unread notifications by category
  const unreadList = notifications.filter(n => n.type === type && n.status === "unread");

  // If no unread → collapse and exit
  if (unreadList.length === 0) {
    container.style.display = "none";
    return;
  }

  // Create UI for unread notifications
  unreadList.forEach(item => {
    const div = document.createElement("div");
    div.className = "notif-item";

    let text = "";

    switch (type) {
      case "request":
        text = `📩 ${item.citizen_name} requested: <b>${item.request_type}</b>`;
        break;

      case "feedback":
        text = `⭐ ${item.citizen_name}: "<b>${item.feedback_text}</b>"`;
        break;

      case "rejected":
        text = `❌ ${item.citizen_name} - Reason: <b>${item.reason || "Not provided"}</b>`;
        break;

      case "completed":
        text = `✅ ${item.citizen_name}'s <b>${item.request_type}</b> completed`;
        break;
    }

    div.innerHTML = text;
    container.appendChild(div);

    // Mark as read in backend — only when category opened
    fetch(`${NOTIF_URL}/${item.id}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    // Update in local notifications array so reload না দেওয়া পর্যন্ত আর দেখা যাবে না
    item.status = "read";
  });

  container.style.display = "block";

  // Reduce unread count for only this category
  document.getElementById(countId).innerText = "0";

  // Reduce sidebar total counter
  const oldTotal = Number(document.getElementById("notifCount").innerText);
  const newTotal = oldTotal - unreadList.length;
  document.getElementById("notifCount").innerText = newTotal >= 0 ? newTotal : 0;
}


// Add click listeners to headings
document.querySelectorAll(".notif-toggle").forEach(h => {
  h.addEventListener("click", () => {
    const type = h.dataset.type;
    const containerId = h.dataset.container;
    const countId = h.dataset.count;

    displayCategory(type, containerId, countId);
  });
});


// Initial load
loadNotifications();
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}