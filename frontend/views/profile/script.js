function openModal() {
    document.getElementById("editModal").style.display = "flex";

    document.getElementById("nameInput").value =
        document.getElementById("nameDisplay").innerText;

    document.getElementById("emailInput").value =
        document.getElementById("emailDisplay").innerText;

    document.getElementById("phoneInput").value =
        document.getElementById("phoneDisplay").innerText === "Not added" ? "" :
        document.getElementById("phoneDisplay").innerText;

    document.getElementById("addressInput").value =
        document.getElementById("addressDisplay").innerText === "Not added" ? "" :
        document.getElementById("addressDisplay").innerText;
}

function closeModal() {
    document.getElementById("editModal").style.display = "none";
}

function saveProfile() {
    document.getElementById("nameDisplay").innerText =
        document.getElementById("nameInput").value;

    document.getElementById("emailDisplay").innerText =
        document.getElementById("emailInput").value;

    document.getElementById("phoneDisplay").innerText =
        document.getElementById("phoneInput").value || "Not added";

    document.getElementById("addressDisplay").innerText =
        document.getElementById("addressInput").value || "Not added";

    const fileInput = document.getElementById("photoInput").files[0];
    if (fileInput) {
        document.getElementById("profilePhoto").src = URL.createObjectURL(fileInput);
    }

    closeModal();
}
