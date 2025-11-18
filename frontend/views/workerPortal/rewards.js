
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // Logged-in worker ID
document.addEventListener('DOMContentLoaded', async () => {
    // const token = localStorage.getItem("token");
    // const userId = localStorage.getItem("userId"); // Logged-in worker ID

    if (!token) {
        window.location.href = "../login/login.html";
        return;
    }

    //  Current Worker Rank 
    try {
        const res = await fetch("http://localhost:5000/api/worker/rank", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();

        document.querySelector('.rank-value').innerText = data.rank ? `#${data.rank}` : 'N/A';
        document.querySelector('.total-value').innerText = data.avg_rating ? data.avg_rating : '0';

    } catch (err) {
        console.error("Error fetching worker rank:", err);
    }

    // Leaderboard (Top 3) 
    try {
        const res = await fetch("http://localhost:5000/api/worker/leaderboard", {
            headers: { Authorization: `Bearer ${token}` }
        });
        const leaderboard = await res.json();

        const tbody = document.querySelector('.leaderboard-container tbody');
        tbody.innerHTML = '';

        // Top 3
        const top3 = leaderboard.slice(0,3);

        top3.forEach(worker => {
            const isCurrent = parseInt(worker.worker_id) === parseInt(userId);
            const rowClass = isCurrent ? 'self-row' : '';
            const row = `
                <tr class="${rowClass}">
                    <td>${worker.ranking}</td>
                    <td>${worker.name}${isCurrent ? " (You)" : ""}</td>
                    <td>${parseFloat(worker.avg_rating).toFixed(2)}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

        // Check if current worker is in top 3
        const isCurrentInTop3 = top3.some(w => parseInt(w.worker_id) === parseInt(userId));

        // extra row append
        if (!isCurrentInTop3) {
            const currentWorker = leaderboard.find(w => parseInt(w.worker_id) === parseInt(userId));
            if (currentWorker) {
                const row = `
                    <tr class="self-row">
                        <td>${currentWorker.ranking}</td>
                        <td>${currentWorker.name} (You)</td>
                        <td>${parseFloat(currentWorker.avg_rating).toFixed(2)}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            }
        }

    } catch (err) {
        console.error("Error fetching leaderboard:", err);
    }

    //  Sidebar links fix 
    const dashboardLink = document.querySelector('.nav-links li:nth-child(1) a');
    dashboardLink.href = 'worker_dashboard.html';
    const tasksLink = document.querySelector('.nav-links li:nth-child(2) a');
    tasksLink.href = 'my_requests.html';
});

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