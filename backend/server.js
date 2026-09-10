require("dotenv").config();
const express = require("express");
const cors = require("cors");

require("./db"); // ensures schema is created on boot

const authRoutes = require("./routes/auth");
const traineeRoutes = require("./routes/trainee");
const trainerRoutes = require("./routes/trainer");
const adminRoutes = require("./routes/admin");
const commonRoutes = require("./routes/common");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "capacity-connect-backend" }));

app.use("/api/auth", authRoutes);
app.use("/api/trainee", traineeRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", commonRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Capacity Connect backend running on http://localhost:${PORT}`);
});
