import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert } from "../../components/UI";

const linesToArray = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export default function TrainerProfile() {
  const { token } = useAuth();
  const [form, setForm] = useState({ bio: "", subjects: "", years_experience: 0, qualifications: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/trainer/profile", token).then((p) => {
      setForm({
        bio: p.bio || "",
        subjects: (p.subjects || []).join("\n"),
        years_experience: p.years_experience || 0,
        qualifications: (p.qualifications || []).join("\n"),
      });
      setLoading(false);
    });
  }, [token]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const onSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.put(
        "/trainer/profile",
        {
          bio: form.bio,
          subjects: linesToArray(form.subjects),
          years_experience: Number(form.years_experience) || 0,
          qualifications: linesToArray(form.qualifications),
        },
        token
      );
      setMessage("Profile saved.");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <>
      <PageHeader title="My Profile" subtitle="Trainers with a complete profile are ranked higher in competency mapping." />
      <form className="panel" onSubmit={onSave} style={{ maxWidth: 640 }}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{message}</Alert>
        <div className="field">
          <label>Bio</label>
          <textarea value={form.bio} onChange={update("bio")} placeholder="A short introduction..." />
        </div>
        <div className="field">
          <label>Subjects you can train on</label>
          <textarea
            value={form.subjects}
            onChange={update("subjects")}
            placeholder={"One per line, e.g.\nNetworking\nCloud Computing"}
          />
          <div className="field-hint">These are matched against subjects in competency mapping.</div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Years of experience</label>
            <input
              type="number"
              min="0"
              value={form.years_experience}
              onChange={update("years_experience")}
            />
          </div>
        </div>
        <div className="field">
          <label>Qualifications</label>
          <textarea
            value={form.qualifications}
            onChange={update("qualifications")}
            placeholder={"One per line"}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Save profile
        </button>
      </form>
    </>
  );
}
