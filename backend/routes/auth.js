const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const db = require("../db");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// POST /api/auth/signup
router.post("/signup", (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "name, email, password, role are required" });
  }
  if (!["trainee", "trainer", "admin"].includes(role)) {
    return res.status(400).json({ error: "role must be trainee, trainer, or admin" });
  }

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) return res.status(409).json({ error: "An account with this email already exists" });

  const id = uuidv4();
  const passwordHash = bcrypt.hashSync(password, 10);
  // Admins require manual approval by an existing admin; trainees/trainers require admin approval too,
  // per the platform's approval workflow.
  const status = "pending";

  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, name, email, passwordHash, role, status);

  if (role === "trainee") {
    db.prepare("INSERT INTO trainee_profiles (user_id) VALUES (?)").run(id);
  } else if (role === "trainer") {
    db.prepare("INSERT INTO trainer_profiles (user_id) VALUES (?)").run(id);
  }

  res.status(201).json({
    message: "Account created. An admin must approve your account before you can log in.",
  });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email and password required" });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid email or password" });

  if (user.status === "pending") {
    return res.status(403).json({ error: "Your account is awaiting admin approval" });
  }
  if (user.status === "rejected") {
    return res.status(403).json({ error: "Your account registration was rejected" });
  }

  const token = signToken(user);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
  });
});

module.exports = router;
