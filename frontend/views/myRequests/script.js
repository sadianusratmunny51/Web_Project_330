const API_URL = "http://localhost:5000/api/requests";

loadRequests();

document
  .getElementById("statusFilter")
  .addEventListener("change", loadRequests);

async function loadRequests() {
  const status = document.getElementById("statusFilter").value;

  const url = status ? `${API_URL}?status=${status}` : API_URL;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const requests = await response.json();
  renderRequests(requests);
}

function renderRequests(requests) {
  const container = document.getElementById("requestContainer");
  container.innerHTML = "";

  if (requests.length === 0) {
    container.innerHTML = `<p>No requests found.</p>`;
    return;
  }

  requests.forEach((req) => {
    const imagePath = req.waste_image
      ? req.waste_image.replace(/\\/g, "/")
      : "no-image.jpg";

    const card = `
      <div class="request-card">

        <div class="left-info">
          <p><span><i class="fa-solid fa-location-dot" style="color:#6f42c1;"></i> 
 Location:</span> ${req.location}</p>
          <p><span><i class="fa-solid fa-circle-dot status-icon" style="color:#4A90E2;"></i>
 Status:</span> 
            <span class="status-badge ${req.status}">
              ${req.status.replace("_", " ")}
            </span>
          </p>
          <p><span><i class="fas fa-recycle" style="color:#9b59b6;"></i>
 Type:</span> ${req.request_type}</p>
          <p><span><i class="fa-solid fa-file-alt" style="color: #3b82f6; margin-right: 6px;"></i> Description
 Description:</span> ${req.description}</p>
          <p><span><i class="fas fa-stopwatch" style="color:#ff2e2e;"></i>
 Priority:</span> ${req.priority}</p>
          <p><span><i class="fa-solid fa-calendar-days" style="color:#4A90E2;"></i>
 Date:</span> ${req.created_at.split("T")[0]}</p>
        </div>

        <div class="right-image">
          <img src="http://localhost:5000/${imagePath}">
        </div>
      </div>
    `;

    container.innerHTML += card;
  });
}
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}
async function loadNotificationCount() {
  try {
    const res = await fetch("http://localhost:5000/api/notifications/user", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    const unreadCounts = data.unreadCounts || {};

    const totalUnread =
      (unreadCounts.completed || 0) +
      (unreadCounts.assigned || 0) +
      (unreadCounts.canceled || 0);

    // dashboard sidebar count
    if (document.getElementById("notifCount")) {
      document.getElementById("notifCount").innerText = totalUnread;
    }
  } catch (err) {
    console.log("Notification Load Error", err);
  }
}
loadNotificationCount();


const taskListContainer=document.getElementById("requestContainer");
const canceelBtn = document.getElementById("cancelBtn");
canceelBtn.addEventListener("click", async () => {
    try {
        const res = await fetch("http://localhost:5000/api/requests?status=pending", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        });

        const tasks = await res.json();
        console.log("➡ Loaded Pending Tasks:", tasks);

        renterTaskForCancel(tasks);
    } catch (err) {
        console.log("Error loading pending tasks", err);
    }
});

function renterTaskForCancel(tasks) {
    taskListContainer.innerHTML = ""; // clear previous data
    if (tasks.length === 0) {
        taskListContainer.innerHTML = "<p>No tasks found.</p>";
        return;
    }
    tasks.forEach(task => {
        const statusClass = {
            pending: "pending",
            assigned: "assigned",
            in_progress: "in-progress",
            completed: "completed",
            canceled: "canceled"
        }[task.status];

        const formattedDate = new Date(task.created_at).toLocaleDateString();
        const typeText = task.request_type === "waste" ? "Waste Pickup" : "Recycling";

        let filename = task.waste_image;
        if (filename) {
            filename = filename.replace(/\\/g, '/').replace(/^uploads\//, '');
        }

        const imgSrc = filename 
            ? `http://localhost:5000/uploads/${encodeURIComponent(filename)}`
            : "https://via.placeholder.com/150x150?text=No+Image";

        // Buttons for assigned tasks
        let actionButtons = "";
        if (task.status === "pending") {
            actionButtons = `
                <div class="task-actions">
                    <button class="cancel-btn" data-id="${task.id}">Cancel</button>
                </div>
            `;
        }

        const card = `
            <div class="task-card">
                <div class="task-details">
                    <p><i class="fa-solid fa-location-dot" style="color:#6f42c1;"></i> <b>Location:</b> ${task.location}</p>
                    <p><i class="fa-solid fa-circle-dot status-icon" style="color:#4A90E2;"></i> <b>Status:</b> <span class="status-tag ${statusClass}">${task.status}</span></p>
                    <p><i class="fas fa-recycle" style="color:#9b59b6;"></i> <b>Type:</b> ${typeText}</p>
                    <p><i class="fa-solid fa-file-alt" style="color: #3b82f6; margin-right: 6px;"></i> <b>Description:</b> ${task.description}</p>
                    <p><i class="fas fa-stopwatch" style="color:#ff2e2e;"></i> <b>Priority:</b> ${task.priority}</p>
                    <p><i class="fa-solid fa-calendar-days" style="color:#4A90E2;"></i> <b>Date:</b> ${formattedDate}</p>
                    ${actionButtons}
                </div>
                <div class="task-image">
                    <img src="${imgSrc}" alt="waste image">
                </div>
            </div>
        `;

        taskListContainer.innerHTML += card;
    });

    document.querySelectorAll(".cancel-btn").forEach(btn => {
        btn.addEventListener("click", () => handleTaskAction(btn.dataset.id, "cancel"));
    });
}

async function handleTaskAction(taskId, action) {
    if (action !== "cancel") return;

    try {
        const res = await fetch(`http://localhost:5000/api/requests/${taskId}/cancel`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
        });

        const data = await res.json();
        console.log("Cancelled:", data.message);

        // reload pending tasks
        cancelBtn.click();

    } catch (err) {
        console.log("Cancel Error:", err);
    }
}
document.getElementById("activityTrack").addEventListener("click", function () {
      window.location.href = "../activityFrontend/index.html";
  });