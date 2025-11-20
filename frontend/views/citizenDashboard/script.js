const BASE_URL = "http://localhost:5000/api/auth";
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}
// load user profile
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
document.getElementById("userName").innerText = localStorage.getItem("name");
document.getElementById("userNameRight").innerText =
  localStorage.getItem("name");

const API_URL = "http://localhost:5000/api/requests";

async function loadRequests() {
  const response = await fetch(API_URL, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const requests = await response.json();

  updateStats(requests);
  updateRecentRequests(requests);
}

function updateStats(requests) {
  const total = requests.length;
  const pending = requests.filter((r) => r.status === "pending").length;
  const inProgress = requests.filter((r) => r.status === "in_progress").length;
  const completed = requests.filter((r) => r.status === "completed").length;
  //   const assigned = requests.filter(r => r.status === "assigned").length;
  const rejected = requests.filter((r) => r.status === "rejected").length;

  document.getElementById("totalReq").innerText = total;
  document.getElementById("pendingReq").innerText = pending;
  document.getElementById("inProgressReq").innerText = inProgress;
  document.getElementById("completedReq").innerText = completed;
  //   document.getElementById("assignedReq").innerText = assigned;
  document.getElementById("rejectedReq").innerText = rejected;
}

function updateRecentRequests(requests) {
  const tbody = document.getElementById("recentRequests");

  tbody.innerHTML = "";
  const sorted = requests.sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const recent = sorted.slice(0, 10);

  recent.forEach((req) => {
    const row = `
      <tr>
        <td>#${req.id}</td>
        <td>${req.request_type}</td>
        <td>${req.created_at.split("T")[0]}</td>
        <td><span class="status ${mapStatus(req.status)}">${formatStatus(
      req.status
    )}</span></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function mapStatus(status) {
  if (status === "pending") return "pending";
  if (status === "in_progress") return "progress";
  if (status === "completed") return "completed";
  if (status === "assigned") return "assigned";
  if (status === "rejected") return "rejected";
}

function formatStatus(status) {
  if (status === "pending") return "Pending";
  if (status === "in_progress") return "In Progress";
  if (status === "completed") return "Completed";
  if (status === "assigned") return "Assigned";
  if (status === "rejected") return "Rejected";
}

async function loadRewards() {
  try {
    const res = await fetch("http://localhost:5000/api/user/rewards", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Reward Error:", data);
      return;
    }

    const total = data.waste_reward_points + data.recycled_reward_points;

    document.getElementById("reward").innerText = total;
  } catch (err) {
    console.error("Reward Fetch Failed:", err);
  }
}
async function submitFeedback() {
  const feedback_text = document.getElementById("feedbackText").value;
  const rating = Number(document.getElementById("rating").value);
  const request_id = document.getElementById("requestId").value;

  if (!feedback_text || !rating || !request_id) {
    alert("Please fill all fields");
    return;
  }

  const res = await fetch("http://localhost:5000/api/feedback/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ request_id, rating, feedback_text }),
  });
  console.log(res);
  const data = await res.json();
  console.log(data);

  if (res.ok) {
    alert("Feedback submitted!");
  } else {
    alert("Error: " + data.message);
  }
}
async function loadNotificationCount() {
  try {
    const res = await fetch("http://localhost:5000/api/notifications/user", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });

    const data = await res.json();

    const unreadCounts = data.unreadCounts || {};

    const totalUnread =
      (unreadCounts.completed || 0) +
      (unreadCounts.assigned || 0) +
      (unreadCounts.rejected || 0);

    // dashboard sidebar count
    if (document.getElementById("notifCount")) {
      document.getElementById("notifCount").innerText = totalUnread;
    }

  } catch (err) {
    console.log("Notification Load Error", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  
  document.getElementById("profileImg").addEventListener("click", function () {
      window.location.href = "../profile/index.html";
  });

});

loadRewards();
loadRequests();
loadNotificationCount();