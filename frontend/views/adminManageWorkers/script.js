const USERS_API = "http://localhost:5000/api/admin/workers";

async function loadUsers() {
  const res = await fetch(USERS_API, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`
    }
  });

  const users = await res.json();
  console.log("API Users:", users);

  showUsers(users);
}

function showUsers(users) {
  console.log("RAW:", users);

  const container = document.getElementById("usersContainer");
  container.innerHTML = "";

  // extract worker list correctly
  const list = users.workers; // backend guaranteed workers array

  if (!Array.isArray(list)) {
    console.error("Workers is not an array");
    return;
  }

  // Only show workers
  const workerUsers = list.filter(u => u.role === "worker");

  workerUsers.forEach(u => {
    const card = `
      <div class="user-card">
        <div class="user-info">
          <p><b>Name:</b> ${u.name}</p>
          <p><b>Email:</b> ${u.email}</p>
        </div>
        <button class="details-btn" onclick="openUserDetails('${u.id}')">
          View Details
        </button>
      </div>
    `;
    container.innerHTML += card;
  });
}

function openUserDetails(id) {
  localStorage.setItem("selected_user_id", id);
  window.location.href = "../userDetails/index.html";
}

loadUsers();
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}