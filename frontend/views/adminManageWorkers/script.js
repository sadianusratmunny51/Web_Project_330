const USERS_API = "http://localhost:5000/api/admin/workers";
const NOTIF_URL = "http://localhost:5000/api/notifications";
let notifications = [];  
async function loadUsers() {
  const res = await fetch(USERS_API, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const users = await res.json();
  console.log("API Users:", users);

  showUsers(users);
}

function showUsers(users) {
  console.log("RAW:", users);

  const container = document.getElementById("usersContainer");
  container.innerHTML = "";

  // extract worker list correctly
  const list = users.workers; // backend guaranteed workers array

  if (!Array.isArray(list)) {
    console.error("Workers is not an array");
    return;
  }

  // Only show workers
  const workerUsers = list.filter(u => u.role === "worker");

  workerUsers.forEach(u => {
    const card = `
      <div class="user-card">
        <div class="user-info">
          <p><b>Name:</b> ${u.name}</p>
          <p><b>Email:</b> ${u.email}</p>
        </div>
        <button class="details-btn" onclick="openUserDetails('${u.id}')">
          View Details
        </button>
      </div>
    `;
    container.innerHTML += card;
  });
}

function openUserDetails(id) {
  localStorage.setItem("selected_user_id", id);
  window.location.href = "../workerDetails/index.html";
}

loadUsers();
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}


async function loadNotifications() {
  const response = await fetch(NOTIF_URL, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });

  const result = await response.json();

  // Store all notifications
  notifications = result.notifications || [];

  // Unread counter object
  const unreadCounts = result.unreadCounts || {};

  // Total sidebar count
  const totalUnread =
    (unreadCounts.request || 0) +
    (unreadCounts.feedback || 0) +
    (unreadCounts.rejected || 0) +
    (unreadCounts.completed || 0);
  console.log(totalUnread)
  document.getElementById("notifCount").innerText = totalUnread;
}
loadNotifications();
