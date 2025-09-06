document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('darkModeToggle');
  const isDark = localStorage.getItem('darkMode') !== 'false';

  document.body.classList.toggle('light-mode', !isDark);
  toggle.checked = !isDark;

  toggle.addEventListener('change', () => {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('darkMode', toggle.checked ? 'false' : 'true');
  });
});
