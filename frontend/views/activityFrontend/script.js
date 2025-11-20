const API_URL="http://localhost:5000/api/user/logInfo";
loadRequests();
async function loadRequests() {
  let url = `${API_URL}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  console.log(response);
  const tasks = await response.json();
  renderRequests(tasks);
}
function renderRequests(requests) {
  const container = document.getElementById("logContainer");
  container.innerHTML = "";

  if (requests.length === 0) {
    container.innerHTML = `<p>No requests found.</p>`;
    return;
  }

  requests.forEach((req) => {

    const card = `
      <div class="request-card">

        <div class="left-info">
          <p><span><i class="fa-solid fa-id-badge" style="color:#6f42c1;"></i>User id: </span> ${req.id}</p>
          <p><span><i class="fa-solid fa-calendar-days" style="color:#4A90E2;"></i>Time_stamp:</span> ${req.timestamp}</p>
          <p><span><i class="fas fa-recycle" style="color:#9b59b6;"></i>Activity Type: </span> ${req.activity_type}</p>
          <p><span><i class="fa-solid fa-file-alt" style="color: #3b82f6; margin-right: 6px;"></i> DescriptionDescription:</span> ${req.description}</p>
        </div>

      </div>
    `;
    container.innerHTML += card;
  });
}


//   document.getElementById("logContainer").addEventListener("click", loadRequests);



