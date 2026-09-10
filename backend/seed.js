require("dotenv").config();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("./db");

const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL || "admin@capacityconnect.org";
const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD || "Admin@123";

function upsertAdmin() {
  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(adminEmail);
  if (existing) {
    console.log(`Admin already exists: ${adminEmail}`);
    return existing.id;
  }
  const id = uuidv4();
  const hash = bcrypt.hashSync(adminPassword, 10);
  db.prepare(
    "INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'admin', 'approved')"
  ).run(id, "Platform Admin", adminEmail, hash);
  console.log(`Created bootstrap admin:\n  email: ${adminEmail}\n  password: ${adminPassword}`);
  return id;
}

function seedWelcomeNotification(adminId) {
  const count = db.prepare("SELECT COUNT(*) as c FROM notifications").get().c;
  if (count > 0) return;
  db.prepare(
    "INSERT INTO notifications (id, type, title, message, created_by) VALUES (?, 'announcement', ?, ?, ?)"
  ).run(
    uuidv4(),
    "Welcome to Capacity Connect",
    "Sign up as a Trainee or Trainer to get started. New accounts need admin approval before logging in.",
    adminId
  );
}

const adminId = upsertAdmin();
seedWelcomeNotification(adminId);
console.log("Seed complete.");
