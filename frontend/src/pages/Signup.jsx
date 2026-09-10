import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/UI";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "trainee" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      const res = await signup(form);
      setSuccess(res.message);
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <h1>Join as a trainee to grow your skills, or a trainer to share yours.</h1>
        <p>
          Every new account is reviewed by an administrator before access is granted, keeping the
          platform's training records trustworthy.
        </p>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Create your account</h2>
          <p>Sign up to enroll in courses or share your training expertise.</p>
          <Alert type="error">{error}</Alert>
          <Alert type="success">{success}</Alert>
          <div className="field">
            <label>Full name</label>
            <input value={form.name} onChange={update("name")} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update("email")} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update("password")} required minLength={6} />
          </div>
          <div className="field">
            <label>I am joining as a</label>
            <select value={form.role} onChange={update("role")}>
              <option value="trainee">Trainee</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Creating account..." : "Create account"}
          </button>
          <div className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
