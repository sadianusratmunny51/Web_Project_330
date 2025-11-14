// Delete Account Modal
const deleteModal = document.getElementById('deleteModal');
const deleteBtn = document.querySelector('.delete-btn');
const closeBtn = document.querySelector('.modal .close');
const cancelBtn = document.getElementById('cancelDeleteBtn');
const confirmBtn = document.getElementById('confirmDeleteBtn');

deleteBtn.onclick = () => deleteModal.style.display = 'flex';
closeBtn.onclick = () => deleteModal.style.display = 'none';
cancelBtn.onclick = () => deleteModal.style.display = 'none';
window.onclick = (e) => { if(e.target === deleteModal) deleteModal.style.display = 'none'; }

confirmBtn.onclick = () => {
  alert('Account deleted successfully!'); // Replace with backend call
  window.location.href = '/login.html'; // Redirect to login
}
