const API_URL = "http://localhost:5000/api/requests";

// Get selected user ID from previous page
const USER_ID = localStorage.getItem("selected_user_id");

if (!USER_ID) {
  alert("No user selected!");
}

// Load requests initially
loadRequests();

// Apply filter
document.getElementById("statusFilter").addEventListener("change", loadRequests);

async function loadRequests() {
  const status = document.getElementById("statusFilter").value;

  const url = status 
    ? `${API_URL}?status=${status}`
    : API_URL;

  const response = await fetch(url, {
    headers: { 
      "Authorization": `Bearer ${localStorage.getItem("token")}` 
    }
  });

  let result = await response.json();

  // Make sure we always get an array
  const requests = Array.isArray(result) ? result : result.requests;

  // FILTER REQUESTS BY USER ID
  const userRequests = requests.filter(r => 
    r.user_id == USER_ID || r.userId == USER_ID
  );

  renderRequests(userRequests);
}

function renderRequests(requests) {
  const container = document.getElementById("requestContainer");
  container.innerHTML = "";

  if (!requests || requests.length === 0) {
    container.innerHTML = `<p>No requests found for this user.</p>`;
    return;
  }

  requests.forEach(req => {
    const imagePath = req.waste_image
      ? req.waste_image.replace(/\\/g, "/")
      : "no-image.jpg";

    const card = `
      <div class="request-card">

        <div class="left-info">
          <p><span>📍 Location:</span> ${req.location}</p>
          <p><span>📌 Status:</span> 
            <span class="status-badge ${req.status}">
              ${req.status.replace("_", " ")}
            </span>
          </p>
          <p><span>🗑️ Type:</span> ${req.request_type}</p>
          <p><span>📝 Description:</span> ${req.description}</p>
          <p><span>⏱ Priority:</span> ${req.priority}</p>
          <p><span>📅 Date:</span> ${req.created_at.split("T")[0]}</p>
        </div>

        <div class="right-image">
          <img src="http://localhost:5000/${imagePath}">
        </div>

      </div>
    `;

    container.innerHTML += card;
  });
}
