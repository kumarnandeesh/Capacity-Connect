const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();
router.use(authRequired, requireRole("trainer"));

function parseProfile(row) {
  if (!row) return null;
  return {
    ...row,
    subjects: JSON.parse(row.subjects || "[]"),
    qualifications: JSON.parse(row.qualifications || "[]"),
  };
}

// GET /api/trainer/profile
router.get("/profile", (req, res) => {
  const row = db.prepare("SELECT * FROM trainer_profiles WHERE user_id = ?").get(req.user.id);
  res.json(parseProfile(row));
});

// PUT /api/trainer/profile
router.put("/profile", (req, res) => {
  const { bio, subjects, years_experience, qualifications } = req.body;
  db.prepare(
    `UPDATE trainer_profiles SET bio = ?, subjects = ?, years_experience = ?, qualifications = ?
     WHERE user_id = ?`
  ).run(
    bio || "",
    JSON.stringify(subjects || []),
    years_experience || 0,
    JSON.stringify(qualifications || []),
    req.user.id
  );
  const row = db.prepare("SELECT * FROM trainer_profiles WHERE user_id = ?").get(req.user.id);
  res.json(parseProfile(row));
});

// GET /api/trainer/courses - courses owned by this trainer
router.get("/courses", (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count
       FROM courses c WHERE c.trainer_id = ? ORDER BY c.created_at DESC`
    )
    .all(req.user.id);
  res.json(rows);
});

// POST /api/trainer/courses
router.post("/courses", (req, res) => {
  const { title, description, subject } = req.body;
  if (!title || !subject) return res.status(400).json({ error: "title and subject are required" });
  const id = uuidv4();
  db.prepare(
    "INSERT INTO courses (id, title, description, subject, trainer_id) VALUES (?, ?, ?, ?, ?)"
  ).run(id, title, description || "", subject, req.user.id);
  res.status(201).json(db.prepare("SELECT * FROM courses WHERE id = ?").get(id));
});

// POST /api/trainer/courses/:id/materials - upload lecture/presentation/study material
router.post("/courses/:id/materials", upload.single("file"), (req, res) => {
  const course = db
    .prepare("SELECT * FROM courses WHERE id = ? AND trainer_id = ?")
    .get(req.params.id, req.user.id);
  if (!course) return res.status(404).json({ error: "Course not found or not owned by you" });
  if (!req.file) return res.status(400).json({ error: "file is required" });

  const { title, type } = req.body;
  const id = uuidv4();
  db.prepare(
    "INSERT INTO materials (id, course_id, trainer_id, type, title, file_path) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, course.id, req.user.id, type || "document", title || req.file.originalname, req.file.filename);
  res.status(201).json(db.prepare("SELECT * FROM materials WHERE id = ?").get(id));
});

// GET /api/trainer/courses/:id/materials
router.get("/courses/:id/materials", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM materials WHERE course_id = ? ORDER BY uploaded_at DESC")
    .all(req.params.id);
  res.json(rows);
});

// POST /api/trainer/questionnaires - create MCQ set with deadline
// body: { course_id, title, subject, deadline, questions: [{question_text, option_a..d, correct_option}] }
router.post("/questionnaires", (req, res) => {
  const { course_id, title, subject, deadline, questions } = req.body;
  const course = db
    .prepare("SELECT * FROM courses WHERE id = ? AND trainer_id = ?")
    .get(course_id, req.user.id);
  if (!course) return res.status(404).json({ error: "Course not found or not owned by you" });
  if (!title || !subject || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: "title, subject, and at least one question are required" });
  }

  const qid = uuidv4();
  db.prepare(
    "INSERT INTO questionnaires (id, course_id, trainer_id, title, subject, deadline) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(qid, course_id, req.user.id, title, subject, deadline || null);

  const insertQ = db.prepare(
    `INSERT INTO questions (id, questionnaire_id, question_text, option_a, option_b, option_c, option_d, correct_option)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (const q of questions) {
    insertQ.run(
      uuidv4(),
      qid,
      q.question_text,
      q.option_a,
      q.option_b,
      q.option_c,
      q.option_d,
      q.correct_option
    );
  }

  res.status(201).json(db.prepare("SELECT * FROM questionnaires WHERE id = ?").get(qid));
});

// GET /api/trainer/questionnaires - list mine
router.get("/questionnaires", (req, res) => {
  const rows = db
    .prepare(
      `SELECT q.*, c.title as course_title,
        (SELECT COUNT(*) FROM submissions s WHERE s.questionnaire_id = q.id) as submission_count
       FROM questionnaires q JOIN courses c ON c.id = q.course_id
       WHERE q.trainer_id = ? ORDER BY q.created_at DESC`
    )
    .all(req.user.id);
  res.json(rows);
});

// GET /api/trainer/questionnaires/:id/results - performance monitoring for one assessment
router.get("/questionnaires/:id/results", (req, res) => {
  const questionnaire = db
    .prepare("SELECT * FROM questionnaires WHERE id = ? AND trainer_id = ?")
    .get(req.params.id, req.user.id);
  if (!questionnaire) return res.status(404).json({ error: "Not found" });

  const results = db
    .prepare(
      `SELECT s.*, u.name as trainee_name, u.email as trainee_email
       FROM submissions s JOIN users u ON u.id = s.trainee_id
       WHERE s.questionnaire_id = ? ORDER BY s.score DESC`
    )
    .all(req.params.id);
  res.json({ questionnaire, results });
});

// GET /api/trainer/courses/:id/trainees - monitor participation for a course
router.get("/courses/:id/trainees", (req, res) => {
  const course = db
    .prepare("SELECT * FROM courses WHERE id = ? AND trainer_id = ?")
    .get(req.params.id, req.user.id);
  if (!course) return res.status(404).json({ error: "Not found" });

  const trainees = db
    .prepare(
      `SELECT u.id, u.name, u.email, e.enrolled_at, e.progress
       FROM enrollments e JOIN users u ON u.id = e.trainee_id
       WHERE e.course_id = ? ORDER BY e.enrolled_at DESC`
    )
    .all(req.params.id);
  res.json(trainees);
});

// GET /api/trainer/feedback - feedback received across my courses
router.get("/feedback", (req, res) => {
  const rows = db
    .prepare(
      `SELECT f.*, c.title as course_title, u.name as trainee_name
       FROM feedback f
       JOIN courses c ON c.id = f.course_id
       JOIN users u ON u.id = f.trainee_id
       WHERE c.trainer_id = ? ORDER BY f.created_at DESC`
    )
    .all(req.user.id);
  res.json(rows);
});

module.exports = router;
