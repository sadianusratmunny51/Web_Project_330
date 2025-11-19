
//  Image Preview Section

document.getElementById("waste_image").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("previewImage");

  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
});


//  Submit Form

document.getElementById("requestForm").addEventListener("submit", async (e) => {
  e.preventDefault();
   
  const token = localStorage.getItem("token");
  if (!token) {
    showErrorMessage("⚠ No token found! Please log in again.");
    return;
  }


  const formData = new FormData();
  
  formData.append("request_type", document.getElementById("request_type").value);
   formData.append("description", document.getElementById("description").value);
     formData.append("location", document.getElementById("location").value);
  formData.append("priority", document.getElementById("priority").value);

 

  const imageFile = document.getElementById("waste_image").files[0];
  if (imageFile) {
    formData.append("waste_image", imageFile);
  }

  try {
    const response = await fetch("http://localhost:5000/api/requests", {
      method: "POST",
      headers: {
    Authorization: "Bearer " + token
  },
      body: formData, 
    });

    const data = await response.json();

    if (response.ok) {
      alert(" Request submitted successfully!"); 
  } }catch (err) {
    console.error(err);
    showErrorMessage("Server error! Please try again.");
  }
});
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}
async function loadNotificationCount() {
  try {
    const res = await fetch("http://localhost:5000/api/notifications/user", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    const unreadCounts = data.unreadCounts || {};

    const totalUnread =
      (unreadCounts.completed || 0) +
      (unreadCounts.assigned || 0) +
      (unreadCounts.rejected || 0);

    // dashboard sidebar count
    if (document.getElementById("notifCount")) {
      document.getElementById("notifCount").innerText = totalUnread;
    }
  } catch (err) {
    console.log("Notification Load Error", err);
  }
}
loadNotificationCount();