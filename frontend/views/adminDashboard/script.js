const API_URL = "http://localhost:5000/api/requests";
const BASE_URL = "http://localhost:5000/api/auth";
const NOTIF_URL = "http://localhost:5000/api/notifications";
let notifications = [];  
document.addEventListener("DOMContentLoaded", () => {
  fetch(`${BASE_URL}/get-user`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  })
    .then((res) => res.json())
    .then((user) => {
      if (!user) return;
      // Profile image
      if (user.profile_image) {
        document.getElementById("profileImg").src = `http://localhost:5000/uploads/profile/${user.profile_image}`;
      }
    });
});
async function loadRequests() {
  const response = await fetch(API_URL, {
    headers: { 
      "Authorization": `Bearer ${localStorage.getItem("token")}` 
    }
  });

  const requests = await response.json();

  updateStats(requests);       
  renderPending(requests); 
}

function updateStats(requests) {
  const total = requests.length;
  const pending = requests.filter(r => r.status === "pending").length;
  const inProgress = requests.filter(r => r.status === "in_progress").length;
  const completed = requests.filter(r => r.status === "completed").length;
  const assigned = requests.filter(r => r.status === "assigned").length;
  const rejected = requests.filter(r => r.status === "rejected").length;

  document.getElementById("totalReq").innerText = total;
  document.getElementById("pendingReq").innerText = pending;
  document.getElementById("inProgressReq").innerText = inProgress;
  document.getElementById("completedReq").innerText = completed;
  document.getElementById("assignedReq").innerText = assigned;
  document.getElementById("rejectedReq").innerText = rejected;
}


function renderPending(requests) {
  const container = document.getElementById("requestContainer");
  container.innerHTML = "";

  const pendingList = requests.filter(r => r.status === "pending");

  if (pendingList.length === 0) {
    container.innerHTML = `<p>No pending requests found.</p>`;
    return;
  }

  pendingList.forEach(req => {
    const imagePath = req.waste_image
      ? req.waste_image.replace(/\\/g, "/")
      : "no-image.jpg";

    const card = `
      <div class="request-card">

        <div class="left-info">
          <p><span><i class="fa-solid fa-location-dot" style="color:#6f42c1;"></i> Location:</span> ${req.location}</p>

          <p><span><i class="fa-solid fa-circle-dot status-icon" style="color:#4A90E2;"></i> Status:</span> 
            <span class="status-badge pending">
              Pending
            </span>
          </p>

          <p><span><i class="fas fa-recycle" style="color:#9b59b6;"></i> Type:</span> ${req.request_type}</p>
          <p><span><i class="fa-solid fa-file-alt" style="color: #3b82f6; margin-right: 6px;"></i> Description:</span> ${req.description}</p>
          <p><span><i class="fas fa-stopwatch" style="color:#ff2e2e;"></i> Priority:</span> ${req.priority}</p>
          <p><span><i class="fa-solid fa-calendar-days" style="color:#4A90E2;"></i> Date:</span> ${req.created_at.split("T")[0]}</p>
        </div>

        <div class="right-image">
          <img src="http://localhost:5000/${imagePath}">
        </div>

      </div>
    `;

    container.innerHTML += card;
  });
}
// http://localhost:5000/api/admin/admins
async function loadUserInfo() {
  const userId = localStorage.getItem("id");
  const role = localStorage.getItem("role");

  const res = await fetch("http://localhost:5000/api/admin/admins", {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const data = await res.json();

  const users = data.admins; 
  console.log(users);


  const currentUser = users.find(u => u.id == userId);
  console.log(currentUser);

  if (currentUser) {
    document.getElementById("userName").innerText = currentUser.name;
    document.getElementById("userNameRight").innerText = currentUser.name;

    if (currentUser.profile_image) {
      document.getElementById("profileImg").src = "http://localhost:5000/" + currentUser.profile_image;
    }
  }
}


loadUserInfo();
loadRequests();
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

  document.getElementById("notifCount").innerText = totalUnread;
}
loadNotifications();
document.addEventListener("DOMContentLoaded", () => {
  
  document.getElementById("profileImg").addEventListener("click", function () {
      window.location.href = "../profile/index.html";
  });

});