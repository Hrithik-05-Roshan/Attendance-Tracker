const form = document.getElementById('signupForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const studentData = {
    fullName: document.getElementById('fullName').value.trim(),
    studentId: document.getElementById('studentId').value.trim(),
    dob: document.getElementById('dob').value,
    gender: document.getElementById('gender').value,
    whatsapp: document.getElementById('whatsapp').value.trim(),
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value
  };

  // Validate password match
  if(studentData.password !== studentData.confirmPassword){
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch('/student-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });

    const result = await response.json();
    if(result.success){
      alert("Signup successful! Please login.");
      window.location.href = '/student-login';
    } else {
      alert(result.message);
    }
  } catch(err){
    console.error(err);
    alert("Something went wrong!");
  }
});
