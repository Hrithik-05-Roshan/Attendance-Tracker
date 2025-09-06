const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const path = require("path");


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/attendance", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));



// serve public assets
app.use(express.static(path.join(__dirname, "public")));

// also expose view subfolders for direct GETs like /auth/student-login.html
app.use('/auth', express.static(path.join(__dirname, 'views', 'auth')));
app.use('/dashboards', express.static(path.join(__dirname, 'views', 'dashboards')));
app.use('/misc', express.static(path.join(__dirname, 'views', 'misc')));



// routes that render top-level views (clean URLs)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});
app.get("/student", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "student-index.html"));
});
app.get("/teacher", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "teacher-index.html"));
});
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "views","auth", "admin-login.html"));
});
app.get("/about-us", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "about-us.html"));
});
app.get("/contact", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "contact.html"));
});
app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "misc","forgot-password.html"));
});

// ----------------- STUDENT -----------------
// Student model
const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  studentId: { type: String, required: true, unique: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true },
  whatsapp: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
});
const Student = mongoose.model("Student", studentSchema);


app.post("/student-signup", async (req, res) => {          // from signup-script.js
  try {
    const { fullName, studentId, dob, gender, whatsapp, password } = req.body;

    // check if student exists
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.json({ success: false, message: "Student ID already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newStudent = new Student({
      fullName,
      studentId,
      dob,
      gender,
      whatsapp,
      password: hashedPassword,
      status: "pending"  // automatically pending
    });

    await newStudent.save();
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Server error" });
  }
});




app.get("/student-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "auth", "student-login.html"));
});




app.post("/student-login", async (req, res) => {
  try {
    const { studentId, password } = req.body;

    // Find student by ID
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.send("Invalid Student ID or Password");
    }

    // Check if approved
    if (student.status !== "approved") {
      return res.send("Your account is not approved yet. Please wait for teacher approval.");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.send("Invalid Student ID or Password");

    // Login successful → redirect to student dashboard
    res.redirect("/student-dashboard");

  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
});

// Student Dashboard page
app.get("/student-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "student-dashboard.html"));
});




app.get("/student-signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "auth", "student-signup.html"));
});



// ----------------- TEACHER -----------------

const teacherSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  teacherId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    sparse: true // optional
  },
  whatsapp: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create Teacher model
const Teacher = mongoose.model("Teacher", teacherSchema);

// ----------------- TEACHER SIGNUP -----------------
app.post("/teacher-signup", async (req, res) => {
  try {
    const { fullName, teacherId, email, whatsapp, gender, password, confirmPassword } = req.body;

    if (!fullName || !teacherId || !whatsapp || !gender || !password || !confirmPassword) {
      return res.send("All fields are required");
    }

    if (password !== confirmPassword) {
      return res.send("Passwords do not match");
    }

    const existingTeacher = await Teacher.findOne({ teacherId });
    if (existingTeacher) {
      return res.send("Teacher ID already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeacher = new Teacher({
      fullName,
      teacherId,
      email,
      whatsapp,
      gender,
      password: hashedPassword
    });

    await newTeacher.save();

    res.redirect("/teacher-login");
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
});

// ----------------- TEACHER LOGIN -----------------
app.get("/teacher-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "auth", "teacher-login.html"));
});

app.post("/teacher-login", async (req, res) => {
  try {
    const { teacherId, password } = req.body;

    const teacher = await Teacher.findOne({ teacherId });
    if (!teacher) {
      return res.send("Invalid Teacher ID or Password");
    }

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.send("Invalid Teacher ID or Password");

    // Redirect to teacher dashboard on successful login
    res.redirect("/teacher-dashboard");
  } catch (err) {
    console.error(err);
    res.send("Server error");
  }
});

// ----------------- TEACHER DASHBOARD -----------------
app.get("/teacher-dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "teacher-dashboard.html"));
});

app.get("/teacher-signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "auth", "teacher-signup.html"));
});
// API to get pending students for approval


// ----------------- TEACHER DASHBOARD API -----------------


// Fetch all students with status "pending"
app.get("/api/pending-students", async (req, res) => {
  try {
    const pendingStudents = await Student.find({ status: "pending" });
    res.json(pendingStudents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Approve a student

app.post("/api/approve-student/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    await Student.findByIdAndUpdate(studentId, { status: "approved" });
    res.json({ message: "Student approved" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// approve a student


app.post("/api/reject-student/:id", async (req, res) => {
  try {
    const studentId = req.params.id;
    await Student.findByIdAndUpdate(studentId, { status: "rejected" });
    res.json({ message: "Student rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// ----------------- ADMIN -----------------
app.get("/admin-login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "auth", "admin-login.html"));
});

app.get("/admin-signup", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "auth", "admin-signup.html"));
});
// --------------------------------------------------------------



// auth POSTs (login / forgot-password)
// ... your existing logic here, but use env vars for credentials (see notes)
app.post("/login", (req, res) => {
  // ...
});
app.post("/forgot-password", (req, res) => {
  // ...
});

// start
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});