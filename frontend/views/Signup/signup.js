// signup.js
const form = document.getElementById("signupForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); 
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  const userData = { name, email, password, role };

  try {
    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Registration successful 🎉");
      
      window.location.href = "../login/index.html";
    } else {
      alert(result.message || "Registration failed ❌");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Try again later!");
  }
});
