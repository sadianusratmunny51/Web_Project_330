document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Login successful");
      

      // Token localStorage
      localStorage.setItem("token", result.token);
       localStorage.setItem("role", result.user.role);

      // Redirect based on actual DB role
      if (result.user.role === "admin") {
        window.location.href = "../adminPortal/index.html";
      } else if (result.user.role === "worker") {
        window.location.href = "../workerPortal/index.html";
      } else {
        window.location.href = "../citizenPortal/index.html";
      }
    } else {
      alert(result.message || "Login failed ");
    }
  } catch (err) {
    console.error(err);
  }
});
