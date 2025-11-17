const NOTIF_URL = "http://localhost:5000/api/worker_notifications/worker";
const NOTIF_BASE = "http://localhost:5000/api/worker_notifications";

let notifications = []; // store all notifications

// Load notifications and update counters
async function loadWorkerNotifications() {
    try {
        const res = await fetch(NOTIF_URL, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        const data = await res.json();

        // Store all notifications in a flat array
        notifications = [...(data.notifications.assigned || []), ...(data.notifications.feedback || [])];

        // Unread counts
        const unreadCounts = data.unreadCounts || { assigned: 0, feedback: 0 };

        // Set category counters
        document.getElementById("newAssignedCount").innerText = unreadCounts.assigned;
        document.getElementById("feedbackCount").innerText = unreadCounts.feedback;

        // Total sidebar counter
        const totalUnread = unreadCounts.assigned + unreadCounts.feedback;
        document.getElementById("notifIconCount").innerText = totalUnread;

    } catch (err) {
        console.error("Failed to load notifications:", err);
    }
}

// Display category (assigned or feedback) and mark unread → read
function displayWorkerCategory(type, containerId, countId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    // Filter unread notifications by type
    const unreadList = notifications.filter(n => n.type === type && n.status === "unread");

    if (unreadList.length === 0) {
        container.style.display = "none";
        return;
    }

    // Create UI for each unread notification
    unreadList.forEach(item => {
        const div = document.createElement("div");
        div.className = "notif-item";
        div.innerHTML = type === "assigned"
            ? `🆕 Task #${item.reference_id} assigned`
            : `⭐ Feedback received for Request #${item.reference_id}`;
        container.appendChild(div);

        // Mark as read in backend
        fetch(`${NOTIF_BASE}/${item.id}/read`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}` 
            }
        });

        // Update local notifications array
        item.status = "read";
    });

    container.style.display = "block";

    // Reduce unread count for this category
    document.getElementById(countId).innerText = "0";

    // Reduce sidebar total counter
    const oldTotal = Number(document.getElementById("notifIconCount").innerText);
    const newTotal = oldTotal - unreadList.length;
    document.getElementById("notifIconCount").innerText = newTotal >= 0 ? newTotal : 0;
}

// Click listeners
document.querySelectorAll(".notif-toggle").forEach(h => {
    h.addEventListener("click", () => {
        const type = h.dataset.type;
        const containerId = h.dataset.container;
        const countId = h.dataset.count;
        displayWorkerCategory(type, containerId, countId);
    });
});

// Initial load
loadWorkerNotifications();

// Sidebar toggle
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
}
