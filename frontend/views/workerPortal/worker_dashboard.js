// ---------------------------------------------
// Token check — Login redirect
// ---------------------------------------------
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "../login/login.html";
}

// const workerName = localStorage.getItem("name");
// console.log("Worker Name:", workerName);

// document.querySelector(".header h1").innerHTML = 
//     `Welcome Back, ${workerName} 🤝`;

// document.querySelector(".user-info").innerHTML =
//     `<i class="fas fa-user-circle"></i> ${workerName}`;


    const BASE_URL = "http://localhost:5000/api/auth";
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



// Fetch Functions


// 1) Get Assigned Requests Count
async function getAssignedRequests() {
  const res = await fetch("http://localhost:5000/api/requests?status=assigned", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

// 2) Get Completed Requests
async function getCompletedRequests() {
  const res = await fetch("http://localhost:5000/api/requests?status=completed", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

// 3) Get Rewards Points
async function getRewardPoints() {
  const res = await fetch("http://localhost:5000/api/user/rewards", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

// 4) Recent Tasks
async function getAllRequests() {
  const res = await fetch("http://localhost:5000/api/requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return await res.json();
}

// Load Dashboard Data

async function loadDashboard() {
  try {
    const [assigned, completed, rewards, allRequests] = await Promise.all([
      getAssignedRequests(),
      getCompletedRequests(),
      getRewardPoints(),
      getAllRequests(),
    ]);

    document.querySelector(".card-value.total").innerText = assigned.length;
    document.querySelector(".card-value.completed").innerText = completed.length;

    const totalPoints = rewards.waste_reward_points + rewards.recycled_reward_points;
    document.querySelector(".card-value.points").innerText = totalPoints;

    const latest = allRequests.slice(0, 3);

    let taskRows = "";
    latest.forEach(r => {
      taskRows += `
        <tr>
            <td>#${r.id}</td>
            <td>${r.request_type === "waste" ? "Household Waste" : "Recycling Pickup"}</td>
            <td>${r.location}</td>
            <td>${new Date(r.created_at).toLocaleString()}</td>
            <td><span class="status-tag ${r.status}">${r.status}</span></td>
        </tr>
      `;
    });

    document.querySelector("tbody").innerHTML = taskRows;

  } catch (err) {
    console.error(err);
  }
}


// WORKER NOTIFICATIONS

const NOTIF_URL = "http://localhost:5000/api/worker_notifications/worker";

async function loadWorkerNotifications() {
    try {
        const res = await fetch(NOTIF_URL, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await res.json();
        const unread = data.unreadCounts || {};

        const totalUnread = (unread.assigned || 0) + (unread.feedback || 0);

        document.getElementById("notifIconCount").innerText = totalUnread;

    } catch (error) {
        console.error("Notification load failed:", error);
    }
}


loadDashboard();
loadWorkerNotifications();

