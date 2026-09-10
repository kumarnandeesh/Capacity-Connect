const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const dbPath = path.join(__dirname, "data.sqlite");
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('trainee','trainer','admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trainee_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  qualifications TEXT DEFAULT '[]',
  work_experience TEXT DEFAULT '[]',
  interests TEXT DEFAULT '[]',
  skills TEXT DEFAULT '[]',
  certificates TEXT DEFAULT '[]',
  bio TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS trainer_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT DEFAULT '',
  subjects TEXT DEFAULT '[]',
  years_experience INTEGER DEFAULT 0,
  qualifications TEXT DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  subject TEXT NOT NULL,
  trainer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  trainer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS enrollments (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  trainee_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
  progress INTEGER DEFAULT 0,
  UNIQUE(course_id, trainee_id)
);

CREATE TABLE IF NOT EXISTS questionnaires (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  trainer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  deadline TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  questionnaire_id TEXT REFERENCES questionnaires(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK(correct_option IN ('a','b','c','d'))
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  questionnaire_id TEXT REFERENCES questionnaires(id) ON DELETE CASCADE,
  trainee_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(questionnaire_id, trainee_id)
);

CREATE TABLE IF NOT EXISTS submission_answers (
  id TEXT PRIMARY KEY,
  submission_id TEXT REFERENCES submissions(id) ON DELETE CASCADE,
  question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
  selected_option TEXT,
  is_correct INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  trainee_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('notification','announcement','achievement','content')),
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

module.exports = db;
