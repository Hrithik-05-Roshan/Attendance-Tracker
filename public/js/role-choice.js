// Simple fade animation — can be expanded later
document.querySelectorAll('.role-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.transition = '0.3s ease';
  });
});
