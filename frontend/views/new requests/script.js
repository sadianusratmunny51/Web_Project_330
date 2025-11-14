
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
      showSuccessMessage(" Request submitted successfully!");
      
      setTimeout(() => {
        window.location.href = "../myRequests/index.html";
      }, 2000);
    } else {
      showErrorMessage((data.message || "Failed to submit request."));
    }
  } catch (err) {
    console.error(err);
    showErrorMessage("Server error! Please try again.");
  }
});

//  Toast Message Functions

function showSuccessMessage(message) {
  showToast(message, "#10b981"); 
}

function showErrorMessage(message) {
  showToast(message, "#ef4444"); 
}

function showToast(message, bgColor) {
  let toast = document.createElement("div");
  toast.innerText = message;
  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.right = "30px";
  toast.style.background = bgColor;
  toast.style.color = "#fff";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.fontWeight = "500";
  toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.4s ease";

  document.body.appendChild(toast);

  setTimeout(() => (toast.style.opacity = "1"), 100);
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 500);
  }, 2000);
}
