const token = localStorage.getItem("token");
const NOTIF_URL = "http://localhost:5000/api/notifications";
let notifications = [];  
// Login না থাকলে redirect
if (!token) {
    window.location.href = "../login/login.html";
}

const taskListContainer = document.querySelector(".task-list");
const filterSelect = document.getElementById("status-filter");    

// Backend → Worker-এর সব tasks আনবে
async function getWorkerTasks(status = "") {
    let url = "http://localhost:5000/api/requests";

    if (status && status !== "All") {
        // Convert frontend status → backend status
        const map = {

            "In Progress": "in_progress",
            "Completed": "completed",
            "Rejected": "rejected",
            "Assigned": "assigned",

        };
        url += `?status=${map[status]}`;
    }

    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    return await res.json();
}

// Task render function
function renderTasks(tasks) {
    taskListContainer.innerHTML = ""; // clear previous data

    if (tasks.length === 0) {
        taskListContainer.innerHTML = "<p>No tasks found.</p>";
        return;
    }

    tasks.forEach(task => {
    // ১. Status class mapping
    const statusClass = {
        pending: "pending",
        assigned: "assigned",
        in_progress: "in-progress",
        completed: "completed",
        rejected: "rejected"
    }[task.status];

    // ২. Date format
    const formattedDate = new Date(task.created_at).toLocaleDateString();

    // ৩. Type
    const typeText = task.request_type === "waste" ? "Waste Pickup" : "Recycling";

    // ✅ ৪. IMAGE URL → এখানে add করতে হবে
    // const imgSrc = task.waste_image 
    //     ? `http://localhost:5000/uploads/${task.waste_image}` 
    //     : "https://via.placeholder.com/150x150?text=No+Image";

    // const imgSrc = task.waste_image 
    // ? `http://localhost:5000/uploads/${encodeURIComponent(task.waste_image)}`
    // : "https://via.placeholder.com/150x150?text=No+Image";
    // ================== fix for filename ==================
let filename = task.waste_image;

// যদি filename থাকে
if (filename) {
    // 1. backslash "\" → slash "/"
    // 2. leading "uploads/" remove
    filename = filename.replace(/\\/g, '/').replace(/^uploads\//, '');
}

// final img src
const imgSrc = filename 
    ? `http://localhost:5000/uploads/${encodeURIComponent(filename)}`
    : "https://via.placeholder.com/150x150?text=No+Image";


    //     // ✅ Debug console.log
    // console.log("Task ID:", task.id);
    // console.log("Waste Image:", task.waste_image);
    // console.log("Image URL:", imgSrc);
    // ৫. Card HTML
    const card = `
        <div class="task-card">
            <div class="task-details">
                <p><i class="fas fa-map-marker-alt icon-red"></i> <b>Location:</b> ${task.location}</p>
                <p><i class="fas fa-spinner icon-red"></i> <b>Status:</b> <span class="status-tag ${statusClass}">${task.status}</span></p>
                <p><i class="fas fa-dumpster-fire icon-gray"></i> <b>Type:</b> ${typeText}</p>
                <p><i class="fas fa-clipboard-list icon-gray"></i> <b>Description:</b> ${task.description}</p>
                <p><i class="fas fa-exclamation-triangle icon-gray"></i> <b>Priority:</b> ${task.priority}</p>
                <p><i class="fas fa-calendar-alt icon-gray"></i> <b>Date:</b> ${formattedDate}</p>
            </div>
            <div class="task-image">
                <img src="${imgSrc}" alt="waste image">
            </div>
        </div>
    `;

    taskListContainer.innerHTML += card;
});

}

// First load → All tasks
async function loadInitialTasks() {
    const tasks = await getWorkerTasks();
    renderTasks(tasks);
}

loadInitialTasks();



// Filter On Change
filterSelect.addEventListener("change", async () => {
    const selectedStatus = filterSelect.value;
    const tasks = await getWorkerTasks(selectedStatus);
    renderTasks(tasks);
});

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