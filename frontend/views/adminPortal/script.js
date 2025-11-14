const API_URL = "http://localhost:5000/api/requests";
const UPDATE_URL = "http://localhost:5000/api/requests/update";
const WORKER_URL = "http://localhost:5000/api/workers";

loadRequests();  
document.getElementById("statusFilter").addEventListener("change", loadRequests);

async function loadRequests() {
  const status = document.getElementById("statusFilter").value;

  const url = status ? `${API_URL}?status=${status}` : API_URL;

  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
  });

  const requests = await response.json();
  loadWorkers();
  renderRequests(requests);
}

let workers = [];

// Load workers for assign dropdown
async function loadWorkers() {
  const res = await fetch(WORKER_URL, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` }
  });
  workers = await res.json();
}

function renderRequests(requests) {
  const container = document.getElementById("adminRequestContainer");
  container.innerHTML = "";

  requests.forEach(req => {
    const workerOptions = workers
      .map(w => `<option value="${w.id}" ${req.assigned_worker_id === w.id ? "selected" : ""}>${w.name}</option>`)
      .join("");

    const card = `
      <div class="request-card">
        
        <div class="left-info">
          <p><b>Location:</b> ${req.location}</p>
          <p><b>Status:</b> <span class="status-badge ${req.status}">${req.status}</span></p>
          <p><b>Description:</b> ${req.description}</p>
        </div>

        <div class="action-box">
          <select id="status-${req.id}">
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select id="worker-${req.id}">
            <option value="">Assign Worker</option>
            ${workerOptions}
          </select>

          <button class="update-btn" onclick="updateStatus(${req.id})">Update</button>
        </div>
      </div>
    `;

    container.innerHTML += card;

    document.getElementById(`status-${req.id}`).value = req.status;
  });
}

async function updateStatus(id) {
  const status = document.getElementById(`status-${id}`).value;
  const worker = document.getElementById(`worker-${id}`).value || null;

  const res = await fetch(`${UPDATE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
    },
    body: JSON.stringify({ status, assigned_worker_id: worker })
  });

  const data = await res.json();
  alert(data.message);

  loadRequests(); // Refresh
}
