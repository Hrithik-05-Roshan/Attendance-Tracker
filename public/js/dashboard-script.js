// Fetch and display pending students
async function loadPendingStudents() {
  const list = document.getElementById("pendingList");
  list.innerHTML = "";

  try {
    const res = await fetch("/api/pending-students");
    const students = await res.json();

    if (students.length === 0) {
      list.innerHTML = "<li>No pending approvals</li>";
      return;
    }

    students.forEach(student => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${student.fullName} (${student.studentId})</span>
        <button onclick="approveStudent('${student._id}')">Approve</button>
        <button onclick="rejectStudent('${student._id}')">Reject</button>
      `;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    list.innerHTML = "<li>Error loading pending students</li>";
  }
}

// Approve a student
async function approveStudent(id) {
  try {
    await fetch(`/api/approve-student/${id}`, { method: "POST" });
    loadPendingStudents(); // Refresh the list
  } catch (err) {
    console.error(err);
  }
}

// Reject a student
async function rejectStudent(id) {
  try {
    await fetch(`/api/reject-student/${id}`, { method: "POST" });
    loadPendingStudents(); // Refresh the list
  } catch (err) {
    console.error(err);
  }
}

// Load pending students when page loads
window.onload = loadPendingStudents;
