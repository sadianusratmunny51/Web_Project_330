document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Login successful ✅");

      // 🔑 Token localStorage এ save করো
      localStorage.setItem("token", result.token);

      // Redirect user portal এ
      window.location.href = "../citizenPortal/index.html";
    } else {
      alert(result.message || "Login failed ❌");
    }
  } catch (err) {
    console.error(err);
  }
});
