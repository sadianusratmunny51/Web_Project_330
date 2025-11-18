const token = localStorage.getItem("token");

// Login not present, redirect
if (!token) {
    window.location.href = "../login/login.html";
}

const taskListContainer = document.querySelector(".task-list");
const filterSelect = document.getElementById("status-filter");
const manageRequestsBtn = document.getElementById("manage-requests-btn");
const updateStatusBtn = document.getElementById("update-status-btn");
    

// Backend → Worker-s all task
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
    // . Status class mapping
    const statusClass = {
        pending: "pending",
        assigned: "assigned",
        in_progress: "in-progress",
        completed: "completed",
        rejected: "rejected"
    }[task.status];

    //  Date format
    const formattedDate = new Date(task.created_at).toLocaleDateString();

    //  Type
    const typeText = task.request_type === "waste" ? "Waste Pickup" : "Recycling";

    //  IMAGE URL → 
    // const imgSrc = task.waste_image 
    //     ? `http://localhost:5000/uploads/${task.waste_image}` 
    //     : "https://via.placeholder.com/150x150?text=No+Image";

    // const imgSrc = task.waste_image 
    // ? `http://localhost:5000/uploads/${encodeURIComponent(task.waste_image)}`
    // : "https://via.placeholder.com/150x150?text=No+Image";
    // ================== fix for filename ==================
let filename = task.waste_image;

// If filename exists
if (filename) {
    // 1. backslash "\" → slash "/"
    // 2. leading "uploads/" remove
    filename = filename.replace(/\\/g, '/').replace(/^uploads\//, '');
}

// final img src
const imgSrc = filename 
    ? `http://localhost:5000/uploads/${encodeURIComponent(filename)}`
    : "https://via.placeholder.com/150x150?text=No+Image";


    //     //  Debug console.log
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


function renderManageTasks(tasks) {
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
            rejected: "rejected"
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
        if (task.status === "assigned") {
            actionButtons = `
                <div class="task-actions">
                    <button class="accept-btn" data-id="${task.id}">Accept</button>
                    <button class="reject-btn" data-id="${task.id}">Reject</button>
                </div>
            `;
        }

        const card = `
            <div class="task-card">
                <div class="task-details">
                    <p><i class="fas fa-map-marker-alt icon-red"></i> <b>Location:</b> ${task.location}</p>
                    <p><i class="fas fa-spinner icon-red"></i> <b>Status:</b> <span class="status-tag ${statusClass}">${task.status}</span></p>
                    <p><i class="fas fa-dumpster-fire icon-gray"></i> <b>Type:</b> ${typeText}</p>
                    <p><i class="fas fa-clipboard-list icon-gray"></i> <b>Description:</b> ${task.description}</p>
                    <p><i class="fas fa-exclamation-triangle icon-gray"></i> <b>Priority:</b> ${task.priority}</p>
                    <p><i class="fas fa-calendar-alt icon-gray"></i> <b>Date:</b> ${formattedDate}</p>
                    ${actionButtons}
                </div>
                <div class="task-image">
                    <img src="${imgSrc}" alt="waste image">
                </div>
            </div>
        `;

        taskListContainer.innerHTML += card;
    });

    // Add click listeners for Accept/Reject buttons
    document.querySelectorAll(".accept-btn").forEach(btn => {
        btn.addEventListener("click", () => handleTaskAction(btn.dataset.id, "accept"));
    });

    document.querySelectorAll(".reject-btn").forEach(btn => {
        btn.addEventListener("click", () => handleTaskAction(btn.dataset.id, "reject"));
    });
}



manageRequestsBtn.addEventListener("click", async () => {
    console.log("➡ Sending status:", "assigned");
    const tasks = await getWorkerTasks("Assigned");
    console.log("➡ Received tasks:", tasks);
    renderManageTasks(tasks);
});


async function handleTaskAction(taskId, action) {
    try {
        const res = await fetch(`http://localhost:5000/api/worker/${taskId}/action`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ action })
        });

        const data = await res.json();
        if (!res.ok) {
            alert(data.message || "Something went wrong");
            return;
        }

        alert(data.message); // Task accepted/rejected

        // Refresh tasks list
        const tasks = await getWorkerTasks("Assigned");
        renderTasks(tasks);

    } catch (err) {
        console.error(err);
        alert("Error updating task");
    }
}

function renderInProgressTasks(tasks) {
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
            rejected: "rejected"
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
        if (task.status === "in_progress") {
            actionButtons = `
                <div class="task-actions">
                    <button class="completed-btn" data-id="${task.id}">Completed</button>

                </div>
            `;
        }

        const card = `
            <div class="task-card">
                <div class="task-details">
                    <p><i class="fas fa-map-marker-alt icon-red"></i> <b>Location:</b> ${task.location}</p>
                    <p><i class="fas fa-spinner icon-red"></i> <b>Status:</b> <span class="status-tag ${statusClass}">${task.status}</span></p>
                    <p><i class="fas fa-dumpster-fire icon-gray"></i> <b>Type:</b> ${typeText}</p>
                    <p><i class="fas fa-clipboard-list icon-gray"></i> <b>Description:</b> ${task.description}</p>
                    <p><i class="fas fa-exclamation-triangle icon-gray"></i> <b>Priority:</b> ${task.priority}</p>
                    <p><i class="fas fa-calendar-alt icon-gray"></i> <b>Date:</b> ${formattedDate}</p>
                    ${actionButtons}
                </div>
                <div class="task-image">
                    <img src="${imgSrc}" alt="waste image">
                </div>
            </div>
        `;

        taskListContainer.innerHTML += card;
    });

    // Add click listeners for Accept/Reject buttons
    document.querySelectorAll(".completed-btn").forEach(btn => {
        btn.addEventListener("click", () => handleInProgressTaskAction(btn.dataset.id));
    });

    // document.querySelectorAll(".reject-btn").forEach(btn => {
    //     btn.addEventListener("click", () => handleTaskAction(btn.dataset.id, "reject"));
    // });
}


// Update Status Button Click
updateStatusBtn.addEventListener("click", async () => {
    const tasks = await getWorkerTasks("In Progress");
    renderInProgressTasks(tasks);
});


async function handleInProgressTaskAction(taskId) {
    try {
        const res = await fetch(`http://localhost:5000/api/worker/${taskId}/complete`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            //body: JSON.stringify({ action })
        });

        const data = await res.json();
        if (!res.ok) {
            alert(data.message || "Something went wrong");
            return;
        }

        alert(data.message); // Task accepted/rejected

        // Refresh tasks list
        const tasks = await getWorkerTasks("In Progress");
        renderInProgressTasks(tasks);
    } catch (err) {
        console.error(err);
        alert("Error updating task");
    }
}

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

loadWorkerNotifications();