const API_URL = "http://localhost:5000/api/requests";
const UPDATE_URL = "http://localhost:5000/api/requests";
const WORKER_URL = "http://localhost:5000/api/workers";

loadRequests();
document.getElementById("statusFilter").addEventListener("change", loadRequests);

async function loadRequests() {
  const status = document.getElementById("statusFilter").value;
  const url = status ? `${API_URL}?status=${status}` : API_URL;

  const response = await fetch(url, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
  });

  const requests = await response.json();
  renderRequests(requests);
}


let workers = [];

async function loadWorkers() {
  const res = await fetch(WORKER_URL, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
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

    // Fix image path
    const imagePath = req.waste_image
      ? req.waste_image.replace(/\\/g, "/")
      : "no-image.jpg";

    const card = `
      <div class="request-card">

        <div class="left-info">
          <p><b>Location:</b> ${req.location}</p>
          <p><b>Status:</b> <span class="status-badge ${req.status}">${req.status}</span></p>
          <p><b>Description:</b> ${req.description}</p>

          <button class="see-image-btn" onclick="showInlineImage('${imagePath}')">
            See Image
          </button>
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
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify({ status, assigned_worker_id: worker })
  });

  const data = await res.json();
  alert(data.message);

  loadRequests();
}


function showInlineImage(imagePath) {
  let clean = imagePath.replace(/\\/g, "/");

  const popupHTML = `
    <div id="inlinePopup" style="
      position: fixed;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999999;
      backdrop-filter: blur(4px);
    ">

      <img src="http://localhost:5000/${clean}" style="
        max-width: 90%;
        max-height: 85%;
        border-radius: 12px;
        box-shadow: 0 0 15px rgba(255,255,255,0.3);
      ">

      <span onclick="document.getElementById('inlinePopup').remove()" style="
        position: fixed;
        top: 20px;
        right: 30px;
        font-size: 45px;
        color: white;
        cursor: pointer;
        font-weight: bold;
        text-shadow: 0 0 10px black;
      ">&times;</span>

    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", popupHTML);
}

