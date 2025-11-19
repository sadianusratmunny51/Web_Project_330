const NOTIF_URL = "http://localhost:5000/api/notifications";

let notifications = []; 
async function loadNotifications() {
  const response = await fetch(`${NOTIF_URL}/user`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });

  const result = await response.json();
  console.log(result)

  notifications = result.notifications || [];
  console.log(notifications)

  const unreadCounts = result.unreadCounts || {};

  document.getElementById("completedCount").innerText = unreadCounts.completed || 0;
  document.getElementById("assignedCount").innerText = unreadCounts.assigned || 0;
  document.getElementById("rejectedCount").innerText = unreadCounts.rejected || 0;

  
  const totalUnread =
    (unreadCounts.completed || 0) +
    (unreadCounts.assigned || 0) +
    (unreadCounts.rejected || 0);

  document.getElementById("notifCount").innerText = totalUnread;
}



// Display selected category and mark unread → read
function displayCategory(type, containerId, countId) {

  const container = document.getElementById(containerId);
  container.innerHTML = "";

  const unreadList = notifications.filter(
    n => n.type === type && n.status === "unread"
  );

  if (unreadList.length === 0) {
    container.style.display = "none";
    return;
  }

  unreadList.forEach(item => {
    const div = document.createElement("div");
    div.className = "notif-item";
    let text = "";

    // COMPLETED
    if (type === "completed") {
      text = `
        Request ID: <b>${item.request_id}</b><br>
        Completed by: <b>${item.worker_name}</b><br>
        Worker Phone: <b>${item.worker_phone}</b><br>
        Worker Email: <b>${item.worker_email}</b>
      `;
    }

    // ASSIGNED
    if (type === "assigned") {
      text = `
        Request ID: <b>${item.request_id}</b><br>
        Assigned to: <b>${item.worker_name}</b><br>
        Worker Phone: <b>${item.worker_phone}</b><br>
        Worker Email: <b>${item.worker_email}</b>
      `;
    }

    // REJECTED
    if (type === "rejected") {
      if (item.rejected_by === "admin") {
        text = `
          Request ID: <b>${item.request_id}</b><br>
          Rejected by: <b>Admin</b><br>
          Reason: ${item.reason || "Not provided"}
        `;
      } 
    }

    div.innerHTML = text;
    container.appendChild(div);

    // Mark notification as read (backend)
    fetch(`${NOTIF_URL}/user/${item.id}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      }
    });

    // Update local status
    item.status = "read";
  });

  container.style.display = "block";

  // Category badge = 0
  document.getElementById(countId).innerText = "0";

  // Reduce total counter
  const oldTotal = Number(document.getElementById("notifCount").innerText);
  document.getElementById("notifCount").innerText = oldTotal - unreadList.length;
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
