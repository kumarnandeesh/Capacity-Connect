const express = require("express");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(authRequired, requireRole("trainee"));

function parseProfile(row) {
  if (!row) return null;
  return {
    ...row,
    qualifications: JSON.parse(row.qualifications || "[]"),
    work_experience: JSON.parse(row.work_experience || "[]"),
    interests: JSON.parse(row.interests || "[]"),
    skills: JSON.parse(row.skills || "[]"),
    certificates: JSON.parse(row.certificates || "[]"),
  };
}

// GET /api/trainee/profile
router.get("/profile", (req, res) => {
  const row = db.prepare("SELECT * FROM trainee_profiles WHERE user_id = ?").get(req.user.id);
  res.json(parseProfile(row));
});

// PUT /api/trainee/profile
router.put("/profile", (req, res) => {
  const { qualifications, work_experience, interests, skills, certificates, bio } = req.body;
  db.prepare(
    `UPDATE trainee_profiles SET
      qualifications = ?, work_experience = ?, interests = ?, skills = ?, certificates = ?, bio = ?
     WHERE user_id = ?`
  ).run(
    JSON.stringify(qualifications || []),
    JSON.stringify(work_experience || []),
    JSON.stringify(interests || []),
    JSON.stringify(skills || []),
    JSON.stringify(certificates || []),
    bio || "",
    req.user.id
  );
  const row = db.prepare("SELECT * FROM trainee_profiles WHERE user_id = ?").get(req.user.id);
  res.json(parseProfile(row));
});

// GET /api/trainee/courses - all available courses + enrollment status
router.get("/courses", (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.*, u.name as trainer_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.trainee_id = ?) as is_enrolled
       FROM courses c LEFT JOIN users u ON u.id = c.trainer_id
       ORDER BY c.created_at DESC`
    )
    .all(req.user.id);
  res.json(courses.map((c) => ({ ...c, is_enrolled: !!c.is_enrolled })));
});

// POST /api/trainee/courses/:id/enroll
router.post("/courses/:id/enroll", (req, res) => {
  const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id);
  if (!course) return res.status(404).json({ error: "Course not found" });
  try {
    db.prepare(
      "INSERT INTO enrollments (id, course_id, trainee_id) VALUES (?, ?, ?)"
    ).run(uuidv4(), course.id, req.user.id);
  } catch (e) {
    return res.status(409).json({ error: "Already enrolled in this course" });
  }
  res.status(201).json({ message: "Enrolled successfully" });
});

// GET /api/trainee/my-courses
router.get("/my-courses", (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.*, u.name as trainer_name, e.progress, e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       LEFT JOIN users u ON u.id = c.trainer_id
       WHERE e.trainee_id = ?
       ORDER BY e.enrolled_at DESC`
    )
    .all(req.user.id);
  res.json(courses);
});

// GET /api/trainee/courses/:id/materials
router.get("/courses/:id/materials", (req, res) => {
  const enrolled = db
    .prepare("SELECT id FROM enrollments WHERE course_id = ? AND trainee_id = ?")
    .get(req.params.id, req.user.id);
  if (!enrolled) return res.status(403).json({ error: "Enroll in the course to access materials" });

  const materials = db
    .prepare("SELECT * FROM materials WHERE course_id = ? ORDER BY uploaded_at DESC")
    .all(req.params.id);
  res.json(materials);
});

// GET /api/trainee/assessments - available questionnaires for enrolled courses
router.get("/assessments", (req, res) => {
  const rows = db
    .prepare(
      `SELECT q.*, c.title as course_title,
        (SELECT COUNT(*) FROM submissions s WHERE s.questionnaire_id = q.id AND s.trainee_id = ?) as attempted
       FROM questionnaires q
       JOIN courses c ON c.id = q.course_id
       JOIN enrollments e ON e.course_id = c.id AND e.trainee_id = ?
       ORDER BY q.deadline ASC`
    )
    .all(req.user.id, req.user.id);
  res.json(rows.map((r) => ({ ...r, attempted: !!r.attempted })));
});

// GET /api/trainee/assessments/:id - questions (without correct answer)
router.get("/assessments/:id", (req, res) => {
  const questionnaire = db.prepare("SELECT * FROM questionnaires WHERE id = ?").get(req.params.id);
  if (!questionnaire) return res.status(404).json({ error: "Assessment not found" });

  const already = db
    .prepare("SELECT * FROM submissions WHERE questionnaire_id = ? AND trainee_id = ?")
    .get(req.params.id, req.user.id);
  if (already) return res.status(409).json({ error: "You have already attempted this assessment" });

  const questions = db
    .prepare(
      "SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE questionnaire_id = ?"
    )
    .all(req.params.id);
  res.json({ questionnaire, questions });
});

// POST /api/trainee/assessments/:id/submit - body: { answers: [{question_id, selected_option}] }
router.post("/assessments/:id/submit", (req, res) => {
  const { answers } = req.body;
  const questionnaire = db.prepare("SELECT * FROM questionnaires WHERE id = ?").get(req.params.id);
  if (!questionnaire) return res.status(404).json({ error: "Assessment not found" });

  const already = db
    .prepare("SELECT * FROM submissions WHERE questionnaire_id = ? AND trainee_id = ?")
    .get(req.params.id, req.user.id);
  if (already) return res.status(409).json({ error: "You have already attempted this assessment" });

  if (questionnaire.deadline && new Date() > new Date(questionnaire.deadline)) {
    return res.status(403).json({ error: "The deadline for this assessment has passed" });
  }

  const questions = db
    .prepare("SELECT * FROM questions WHERE questionnaire_id = ?")
    .all(req.params.id);
  const questionMap = Object.fromEntries(questions.map((q) => [q.id, q]));

  let score = 0;
  const submissionId = uuidv4();
  db.prepare(
    "INSERT INTO submissions (id, questionnaire_id, trainee_id, score, total) VALUES (?, ?, ?, 0, ?)"
  ).run(submissionId, req.params.id, req.user.id, questions.length);

  const insertAnswer = db.prepare(
    "INSERT INTO submission_answers (id, submission_id, question_id, selected_option, is_correct) VALUES (?, ?, ?, ?, ?)"
  );

  for (const ans of answers || []) {
    const q = questionMap[ans.question_id];
    if (!q) continue;
    const correct = q.correct_option === ans.selected_option ? 1 : 0;
    if (correct) score += 1;
    insertAnswer.run(uuidv4(), submissionId, q.id, ans.selected_option, correct);
  }

  db.prepare("UPDATE submissions SET score = ? WHERE id = ?").run(score, submissionId);

  res.status(201).json({ score, total: questions.length });
});

// GET /api/trainee/results
router.get("/results", (req, res) => {
  const results = db
    .prepare(
      `SELECT s.*, q.title as assessment_title, q.subject, c.title as course_title
       FROM submissions s
       JOIN questionnaires q ON q.id = s.questionnaire_id
       JOIN courses c ON c.id = q.course_id
       WHERE s.trainee_id = ?
       ORDER BY s.submitted_at DESC`
    )
    .all(req.user.id);
  res.json(results);
});

// POST /api/trainee/courses/:id/feedback
router.post("/courses/:id/feedback", (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "rating must be between 1 and 5" });
  }
  db.prepare(
    "INSERT INTO feedback (id, course_id, trainee_id, rating, comment) VALUES (?, ?, ?, ?, ?)"
  ).run(uuidv4(), req.params.id, req.user.id, rating, comment || "");
  res.status(201).json({ message: "Feedback submitted" });
});

// GET /api/trainee/notifications
router.get("/notifications", (req, res) => {
  const rows = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50").all();
  res.json(rows);
});

module.exports = router;
