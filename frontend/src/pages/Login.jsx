import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert } from "../components/UI";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(`/${user.role}/home`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <h1>Building organizational capacity, one trained skill at a time.</h1>
        <p>
          Capacity Connect brings trainees, trainers, and administrators onto one platform for
          structured training, competency development, and knowledge sharing.
        </p>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Log in</h2>
          <p>Access your Capacity Connect account.</p>
          <Alert>{error}</Alert>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={busy} style={{ width: "100%" }}>
            {busy ? "Logging in..." : "Log in"}
          </button>
          <div className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
