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

const workerId = localStorage.getItem("id"); // Assuming you save the user's ID here

// 4) Get Worker Status (Uses :id path for fetching)
async function getWorkerStatus() {
 // const workerId = localStorage.getItem("user_id"); 
    if (!workerId) {
        console.error("Worker ID not found in localStorage.");
        return { status: "free" }; // Default status
    }
    const res = await fetch(`http://localhost:5000/api/workers/${workerId}/status`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Fetching status for Worker ID:", workerId);
    console.log("Worker Status Response:", data);
    return data;
}

// 5) Update Worker Status (Uses /status path for updating)
async function updateWorkerStatus(newStatus) {
    const res = await fetch("http://localhost:5000/api/workers/status", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) {
        throw new Error("Failed to update status");
    }
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
    const [assigned, completed, rewards, allRequests, workerStatus] = await Promise.all([
      getAssignedRequests(),
      getCompletedRequests(),
      getRewardPoints(),
      getAllRequests(),
      getWorkerStatus()
    ]);

    document.querySelector(".card-value.total").innerText = assigned.length;
    document.querySelector(".card-value.completed").innerText = completed.length;

    const totalPoints = rewards.waste_reward_points + rewards.recycled_reward_points;
    document.querySelector(".card-value.points").innerText = totalPoints;
    document.getElementById("currentStatusDisplay").innerText = workerStatus.status || "free";

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

document.addEventListener('DOMContentLoaded', () => {
    const changeStatusBtn = document.getElementById('changeStatusBtn');
    const statusDropdown = document.getElementById('statusDropdown');
    const currentStatusDisplay = document.getElementById('currentStatusDisplay');
    
    // Check if statusDropdown exists before calling querySelectorAll
    const statusOptions = statusDropdown ? statusDropdown.querySelectorAll('.status-option') : [];

    if (!changeStatusBtn || !statusDropdown || !currentStatusDisplay) {
        return;
    }

    changeStatusBtn.addEventListener('click', function(event) {
        event.stopPropagation();
        statusDropdown.classList.toggle('show');
    });

    statusOptions.forEach(option => {
        option.addEventListener('click', async function(event) {
            
            const newStatus = this.getAttribute('data-status');
            
            statusDropdown.classList.remove('show');

            currentStatusDisplay.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
            currentStatusDisplay.classList.remove('free', 'busy');
            currentStatusDisplay.classList.add(newStatus);

            try {
                await updateWorkerStatus(newStatus);
            } catch (error) {
                console.error("Failed to send status update to server:", error);
            }
            
        });
    });

    document.addEventListener('click', function(event) {
        if (statusDropdown.classList.contains('show') && !statusDropdown.contains(event.target) && event.target !== changeStatusBtn) {
            statusDropdown.classList.remove('show');
        }
    });
});
