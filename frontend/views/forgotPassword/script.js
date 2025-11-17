const BASE_URL = "http://localhost:5000/api/auth";

// SEND OTP
document.getElementById("forgotForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;

  fetch(`${BASE_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);

      if (data.message === "OTP sent to your email") {
        document.getElementById("forgotForm").style.display = "none";
        document.getElementById("otpForm").style.display = "block";
      }
    })
    .catch(err => console.log(err));
});


// VERIFY OTP + RESET PASSWORD
document.getElementById("otpForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const otp = document.getElementById("otp").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // RESET PASSWORD directly (Backend handles OTP validation)
  fetch(`${BASE_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      email, 
      otp, 
      new_password: newPassword 
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);

      if (data.message === "Password reset successful!") {
        window.location.href = "../login/index.html";
      }
    });
});
