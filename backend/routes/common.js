const express = require("express");
const path = require("path");
const db = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// GET /api/me
router.get("/me", authRequired, (req, res) => {
  const user = db
    .prepare("SELECT id, name, email, role, status, created_at FROM users WHERE id = ?")
    .get(req.user.id);
  res.json(user);
});

// GET /api/home-feed - notifications/announcements/achievements/new content for the homepage
router.get("/home-feed", authRequired, (req, res) => {
  const rows = db.prepare("SELECT * FROM notifications ORDER BY created_at DESC LIMIT 30").all();
  res.json(rows);
});

// GET /api/files/:filename - secure download of a trainer-library material
router.get("/files/:filename", authRequired, (req, res) => {
  const material = db
    .prepare("SELECT * FROM materials WHERE file_path = ?")
    .get(req.params.filename);
  if (!material) return res.status(404).json({ error: "File not found" });

  const isOwnerTrainer = req.user.role === "trainer" && req.user.id === material.trainer_id;
  const isAdmin = req.user.role === "admin";
  const isEnrolledTrainee =
    req.user.role === "trainee" &&
    db
      .prepare("SELECT id FROM enrollments WHERE course_id = ? AND trainee_id = ?")
      .get(material.course_id, req.user.id);

  if (!isOwnerTrainer && !isAdmin && !isEnrolledTrainee) {
    return res.status(403).json({ error: "You do not have access to this file" });
  }

  const filePath = path.join(__dirname, "..", "uploads", material.file_path);
  res.download(filePath, material.title);
});

module.exports = router;
