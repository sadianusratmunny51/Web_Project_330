const USERS_API = "http://localhost:5000/api/admin/users";

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

  // If API returns object → extract array
  let list = Array.isArray(users) ? users : users.users;

  if (!Array.isArray(list)) {
    console.error("Users is not an array");
    return;
  }

  // Filter citizens
  const citizenUsers = list.filter(u =>
    u.role && u.role.toLowerCase() === "citizen"
  );

  citizenUsers.forEach(user => {
    const card = `
      <div class="user-card">
        <div class="user-info">
          <p><b>Name:</b> ${user.name || user.fullName || "N/A"}</p>
          <p><b>Email:</b> ${user.email || "N/A"}</p>
          <p><b>Phone:</b> ${user.phone || user.mobile || "N/A"}</p>
        </div>
        <button class="details-btn" onclick="openUserDetails('${user.id || user._id}')">
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