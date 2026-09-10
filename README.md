# Capacity Connect

A Digital Capacity Building and Learning Management Portal for organizational
training, competency development, and knowledge sharing — built with three
roles: **Trainee**, **Trainer**, and **Admin**.

## Stack

- **Backend:** Node.js + Express, SQLite via Node's built-in `node:sqlite`
  module (a single file database — no separate DB server, and no native
  compilation/build tools needed on any OS), JWT auth, file uploads via
  `multer`.
- **Frontend:** React + Vite, plain CSS (no framework), client-side routing
  with `react-router-dom`.

## Features

- **Auth:** signup/login for all three roles; new accounts require admin
  approval before they can log in.
- **Trainee:** professional profile (qualifications, work experience,
  interests, skills, certificates), browse & enroll in courses, access the
  trainer's library of materials for enrolled courses, attempt subject-wise
  MCQ assessments with deadlines, view results history, leave course feedback.
- **Trainer:** profile with tagged subjects and experience, create courses,
  upload lectures/presentations/study material to a course library, create
  MCQ questionnaires with deadlines, monitor trainee participation and
  assessment performance, view feedback received.
- **Admin:** approve/reject new accounts, manage user roles, platform-wide
  dashboard (users, courses, enrollments, assessments, average scores),
  course oversight (create/assign courses to trainers), **competency
  mapping** (ranks approved trainers for a given subject by tagged
  expertise, years of experience, average feedback rating, and courses
  taught), and publish notifications/announcements/achievements/new content
  to the homepage feed.

## Prerequisites

- Node.js **22.5+** and npm (the backend uses Node's built-in `node:sqlite`
  module — you'll see a one-line `ExperimentalWarning: SQLite is an
  experimental feature` in the terminal when the server starts; that's
  expected and harmless).

## 1. Backend setup

```bash
cd backend
npm install
npm run seed   # creates the SQLite database and a bootstrap admin account
npm run dev    # starts the API on http://localhost:5000
```

The seed script prints the bootstrap admin's login credentials (also
configurable in `backend/.env`):

```
email: admin@capacityconnect.org
password: Admin@123
```

Change these in `backend/.env` before running `npm run seed` if you'd like
different defaults, and change `JWT_SECRET` before any real deployment.

## 2. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
npm run dev    # starts the app on http://localhost:5173
```

Open http://localhost:5173 in your browser.

## 3. Try it out

1. Log in as the bootstrap admin (credentials above).
2. In a private/incognito window, sign up as a **Trainer** and as a
   **Trainee** (two separate accounts).
3. Back in the admin tab, go to **User Approvals** and approve both new
   accounts.
4. Log in as the trainer: fill in your profile (tag subjects you can train
   on), create a course, upload a material file, and create a questionnaire
   with a few MCQs and a deadline.
5. Log in as the trainee: browse courses, enroll, open the course to view
   materials and leave feedback, then attempt the assessment.
6. Back as admin: check the **Dashboard** for live stats, and try
   **Competency Mapping** with the subject you tagged on the trainer's
   profile.

## Project structure

```
capacity-connect/
  backend/
    server.js          Express app entrypoint
    db.js               SQLite connection + schema
    seed.js              Bootstrap admin + welcome announcement
    middleware/          auth (JWT) and upload (multer) middleware
    routes/               auth, trainee, trainer, admin, common route handlers
    uploads/               uploaded course materials land here
  frontend/
    src/
      pages/               one folder per role (trainee/trainer/admin) + auth pages
      components/          Layout, ProtectedRoute, shared UI pieces
      context/AuthContext.jsx
      api.js               fetch wrapper for the backend API
      styles.css            design tokens + component styles
```

## Notes / next steps for a hackathon demo

- The SQLite file (`backend/data.sqlite`) is created on first run and is
  gitignored — delete it and re-run `npm run seed` any time you want a clean
  slate.
- File uploads are stored on local disk under `backend/uploads/` and served
  through an authenticated download route (so a trainee can only download
  material for a course they're enrolled in).
- The competency-mapping score is a simple, transparent heuristic (subject
  tag match + experience + feedback rating + courses taught) — swap in a
  more sophisticated model or an LLM-based reasoning step over trainer
  profiles if you want a stronger AI story for judging.
