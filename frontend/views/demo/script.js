const PROFILE_PIC="http://localhost:5000/api/auth/profile/pic";
const USER_API=

// Editable fields
document.querySelectorAll(".edit-btn").forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const row = btn.parentElement;
    const valueSpan = row.querySelector(".value");
    const field = row.dataset.field;

    // create input
    const input = document.createElement("input");
    input.type = "text";
    input.value = valueSpan.textContent;
    input.className = "edit-input";

    // replace span with input
    row.replaceChild(input,valueSpan);
    btn.style.display="none";

    // save on enter
    input.addEventListener("keypress",(e)=>{
      if(e.key==="Enter"){
        const newValue=input.value;
        const newSpan=document.createElement("span");
        newSpan.className="value";
        newSpan.textContent=newValue;
        row.replaceChild(newSpan,input);
        btn.style.display="inline";
        // Update displayName if fullName changed
        if(field==="fullName"){
          document.getElementById("displayName").textContent=newValue;
        }
      }
    });
  });
});

// Password Modal
const modal=document.getElementById("passwordModal");
document.querySelector(".change-password-btn").onclick=()=>{modal.style.display="flex";}
document.querySelector(".close").onclick=()=>{modal.style.display="none";}
window.onclick=(e)=>{if(e.target==modal) modal.style.display="none";}
document.getElementById("savePasswordBtn").onclick=()=>{
  const oldP=document.getElementById("oldPassword").value;
  const newP=document.getElementById("newPassword").value;
  const confirmP=document.getElementById("confirmPassword").value;
  if(newP && newP===confirmP){
    alert("Password changed successfully!");
    modal.style.display="none";
    document.getElementById("oldPassword").value="";
    document.getElementById("newPassword").value="";
    document.getElementById("confirmPassword").value="";
  }else{
    alert("Passwords do not match!");
  }
};
