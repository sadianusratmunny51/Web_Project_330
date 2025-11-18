const BASE_URL = "http://localhost:5000/api/auth";  
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "../login/index.html";
}

const userId = localStorage.getItem("id");

// load user profile
document.addEventListener("DOMContentLoaded", () => {
  fetch(`${BASE_URL}/get-user`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(user => {
    if (!user) return;

    // Text fields
    document.getElementById("displayName").textContent = user.name;
    document.querySelector(".email").textContent = user.email;

    document.querySelector("[data-field='fullName'] .value").textContent = user.name;
    document.querySelector("[data-field='email'] .value").textContent = user.email;
    document.querySelector("[data-field='phone'] .value").textContent = user.phone || "Not added";
    document.querySelector("[data-field='address'] .value").textContent = user.location || "Not added";

    // Profile image
    if (user.profile_image) {
      document.querySelector(".avatar").src = `http://localhost:5000/uploads/profile/${user.profile_image}`;
    }
  });
});

document.querySelector("input[name='image']").addEventListener("change", function () {
  const formData = new FormData();
  formData.append("image", this.files[0]); // name MUST match backend

  fetch(`${BASE_URL}/profile/pic`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    location.reload();
  })
  .catch(err => console.error(err));
});

// enable edit btn
document.querySelectorAll(".edit-btn").forEach(editBtn => {
  editBtn.addEventListener("click", () => {
    const row = editBtn.parentElement;
    const valueSpan = row.querySelector(".value");
    const currentValue = valueSpan.textContent;

    // Prevent duplicate input
    if (!valueSpan.querySelector("input")) {
      valueSpan.innerHTML = `<input type="text" class="edit-input" value="${currentValue}"/>`;
    }
  });
});

// save changes
document.querySelector(".save-btn").addEventListener("click", () => {
  const name = document.querySelector("[data-field='fullName'] .edit-input")?.value ||
                    document.querySelector("[data-field='fullName'] .value").textContent;

  const email = document.querySelector("[data-field='email'] .edit-input")?.value ||
                document.querySelector("[data-field='email'] .value").textContent;

  const phone = document.querySelector("[data-field='phone'] .edit-input")?.value ||
                document.querySelector("[data-field='phone'] .value").textContent;

  const location = document.querySelector("[data-field='address'] .edit-input")?.value ||
                  document.querySelector("[data-field='address'] .value").textContent;

  fetch(`${BASE_URL}/update-profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, email, phone, location }),
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message || "Updated!");
    location.reload();
  });
});

// password mode open
const modal = document.getElementById("passwordModal");

document.querySelector(".change-password-btn").addEventListener("click", () => {
  modal.style.display = "flex";
});

document.querySelector(".close").addEventListener("click", () => {
  modal.style.display = "none";
});

// update password
document.getElementById("savePasswordBtn").addEventListener("click", () => {
  const old_password = document.getElementById("oldPassword").value;
  const new_password = document.getElementById("newPassword").value;
  const confirm_password = document.getElementById("confirmPassword").value;

  if (new_password !== confirm_password) {
    alert("Passwords do not match!");
    return;
  }

  fetch(`${BASE_URL}/change-password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ old_password, new_password }),
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    modal.style.display = "none";
  });
});

document.querySelector(".delete-btn").addEventListener("click", () => {
  if (!confirm("Are you sure?")) return;

  fetch(`${BASE_URL}/delete-account`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  })
  .then(res => res.json())
  .then(data => {
    alert(data.message);
    localStorage.clear();
    window.location.href = "../login/index.html";
  });
});

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const activeInput = document.querySelector(".edit-input");
    if (activeInput) {
      activeInput.blur(); 
    }
  }
});

document.addEventListener("blur", function (e) {
  if (e.target.classList.contains("edit-input")) {
    const newValue = e.target.value;
    const parentSpan = e.target.parentElement;

    parentSpan.textContent = newValue; 
  }
}, true);

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