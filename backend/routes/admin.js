const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired, requireRole("admin"));

// GET /api/admin/users?status=pending
router.get("/users", (req, res) => {
  const { status, role } = req.query;
  let query = "SELECT id, name, email, role, status, created_at FROM users WHERE 1=1";
  const params = [];
  if (status) {
    query += " AND status = ?";
    params.push(status);
  }
  if (role) {
    query += " AND role = ?";
    params.push(role);
  }
  query += " ORDER BY created_at DESC";
  res.json(db.prepare(query).all(...params));
});

// POST /api/admin/users/:id/approve
router.post("/users/:id/approve", (req, res) => {
  const result = db.prepare("UPDATE users SET status = 'approved' WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "User not found" });
  res.json({ message: "User approved" });
});

// POST /api/admin/users/:id/reject
router.post("/users/:id/reject", (req, res) => {
  const result = db.prepare("UPDATE users SET status = 'rejected' WHERE id = ?").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "User not found" });
  res.json({ message: "User rejected" });
});

// PUT /api/admin/users/:id/role - body: { role }
router.put("/users/:id/role", (req, res) => {
  const { role } = req.body;
  if (!["trainee", "trainer", "admin"].includes(role)) {
    return res.status(400).json({ error: "Invalid role" });
  }
  const result = db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: "User not found" });

  // Ensure a profile row exists for the new role
  if (role === "trainee") {
    db.prepare("INSERT OR IGNORE INTO trainee_profiles (user_id) VALUES (?)").run(req.params.id);
  } else if (role === "trainer") {
    db.prepare("INSERT OR IGNORE INTO trainer_profiles (user_id) VALUES (?)").run(req.params.id);
  }
  res.json({ message: "Role updated" });
});

// GET /api/admin/dashboard - aggregate stats
router.get("/dashboard", (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users").get().c;
  const totalTrainees = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'trainee'").get().c;
  const totalTrainers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'trainer'").get().c;
  const pendingApprovals = db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'pending'").get().c;
  const totalCourses = db.prepare("SELECT COUNT(*) as c FROM courses").get().c;
  const totalEnrollments = db.prepare("SELECT COUNT(*) as c FROM enrollments").get().c;
  const totalAssessments = db.prepare("SELECT COUNT(*) as c FROM questionnaires").get().c;
  const totalSubmissions = db.prepare("SELECT COUNT(*) as c FROM submissions").get().c;
  const avgScorePct = db
    .prepare(
      "SELECT AVG(CASE WHEN total > 0 THEN (score * 100.0 / total) ELSE 0 END) as avg FROM submissions"
    )
    .get().avg;

  const coursesBySubject = db
    .prepare("SELECT subject, COUNT(*) as count FROM courses GROUP BY subject")
    .all();

  const enrollmentsPerCourse = db
    .prepare(
      `SELECT c.title, COUNT(e.id) as enrollments
       FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
       GROUP BY c.id ORDER BY enrollments DESC LIMIT 10`
    )
    .all();

  res.json({
    totalUsers,
    totalTrainees,
    totalTrainers,
    pendingApprovals,
    totalCourses,
    totalEnrollments,
    totalAssessments,
    totalSubmissions,
    avgScorePct: avgScorePct ? Math.round(avgScorePct * 10) / 10 : 0,
    coursesBySubject,
    enrollmentsPerCourse,
  });
});

// GET /api/admin/courses - all courses (admin oversight)
router.get("/courses", (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, u.name as trainer_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count
       FROM courses c LEFT JOIN users u ON u.id = c.trainer_id
       ORDER BY c.created_at DESC`
    )
    .all();
  res.json(rows);
});

// POST /api/admin/courses - admin can also create/assign a course to a trainer
router.post("/courses", (req, res) => {
  const { title, description, subject, trainer_id } = req.body;
  if (!title || !subject) return res.status(400).json({ error: "title and subject are required" });
  const id = uuidv4();
  db.prepare(
    "INSERT INTO courses (id, title, description, subject, trainer_id) VALUES (?, ?, ?, ?, ?)"
  ).run(id, title, description || "", subject, trainer_id || null);
  res.status(201).json(db.prepare("SELECT * FROM courses WHERE id = ?").get(id));
});

// GET /api/admin/competency-mapping?subject=Networking
// Ranks approved trainers by overlap between their tagged subjects/qualifications and the requested subject,
// plus average feedback rating on courses they've run in related subjects.
router.get("/competency-mapping", (req, res) => {
  const subject = (req.query.subject || "").trim().toLowerCase();

  const trainers = db
    .prepare(
      `SELECT u.id, u.name, u.email, tp.subjects, tp.years_experience, tp.qualifications
       FROM users u JOIN trainer_profiles tp ON tp.user_id = u.id
       WHERE u.role = 'trainer' AND u.status = 'approved'`
    )
    .all();

  const scored = trainers.map((t) => {
    const subjects = JSON.parse(t.subjects || "[]").map((s) => String(s).toLowerCase());
    const directMatch = subject ? subjects.some((s) => s.includes(subject) || subject.includes(s)) : false;

    const ratingRow = db
      .prepare(
        `SELECT AVG(f.rating) as avg_rating, COUNT(f.id) as feedback_count
         FROM feedback f
         JOIN courses c ON c.id = f.course_id
         WHERE c.trainer_id = ?`
      )
      .get(t.id);

    const coursesTaught = db
      .prepare("SELECT COUNT(*) as c FROM courses WHERE trainer_id = ?")
      .get(t.id).c;

    let score = 0;
    if (directMatch) score += 60;
    score += Math.min(t.years_experience || 0, 10) * 2; // up to +20
    score += (ratingRow.avg_rating || 0) * 4; // up to +20
    score += Math.min(coursesTaught, 5); // up to +5

    return {
      id: t.id,
      name: t.name,
      email: t.email,
      subjects: JSON.parse(t.subjects || "[]"),
      years_experience: t.years_experience,
      avg_rating: ratingRow.avg_rating ? Math.round(ratingRow.avg_rating * 10) / 10 : null,
      feedback_count: ratingRow.feedback_count,
      courses_taught: coursesTaught,
      direct_subject_match: directMatch,
      match_score: Math.round(score * 10) / 10,
    };
  });

  scored.sort((a, b) => b.match_score - a.match_score);
  res.json({ subject: req.query.subject || null, ranked_trainers: scored });
});

// POST /api/admin/notifications - publish notification/announcement/achievement/content
router.post("/notifications", (req, res) => {
  const { type, title, message } = req.body;
  if (!["notification", "announcement", "achievement", "content"].includes(type)) {
    return res.status(400).json({ error: "Invalid notification type" });
  }
  if (!title) return res.status(400).json({ error: "title is required" });
  const id = uuidv4();
  db.prepare(
    "INSERT INTO notifications (id, type, title, message, created_by) VALUES (?, ?, ?, ?, ?)"
  ).run(id, type, title, message || "", req.user.id);
  res.status(201).json(db.prepare("SELECT * FROM notifications WHERE id = ?").get(id));
});

// GET /api/admin/notifications
router.get("/notifications", (req, res) => {
  res.json(db.prepare("SELECT * FROM notifications ORDER BY created_at DESC").all());
});

// DELETE /api/admin/notifications/:id
router.delete("/notifications/:id", (req, res) => {
  db.prepare("DELETE FROM notifications WHERE id = ?").run(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
