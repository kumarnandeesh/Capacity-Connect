import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert } from "../../components/UI";

const linesToArray = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export default function TraineeProfile() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    bio: "",
    qualifications: "",
    work_experience: "",
    interests: "",
    skills: "",
    certificates: "",
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/trainee/profile", token).then((p) => {
      setForm({
        bio: p.bio || "",
        qualifications: (p.qualifications || []).join("\n"),
        work_experience: (p.work_experience || []).join("\n"),
        interests: (p.interests || []).join("\n"),
        skills: (p.skills || []).join("\n"),
        certificates: (p.certificates || []).join("\n"),
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
        "/trainee/profile",
        {
          bio: form.bio,
          qualifications: linesToArray(form.qualifications),
          work_experience: linesToArray(form.work_experience),
          interests: linesToArray(form.interests),
          skills: linesToArray(form.skills),
          certificates: linesToArray(form.certificates),
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
      <PageHeader title="My Profile" subtitle="Keep your qualifications, experience, and skills up to date." />
      <form className="panel" onSubmit={onSave} style={{ maxWidth: 640 }}>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{message}</Alert>
        <div className="field">
          <label>About you</label>
          <textarea value={form.bio} onChange={update("bio")} placeholder="A short introduction..." />
        </div>
        <div className="field">
          <label>Qualifications</label>
          <textarea
            value={form.qualifications}
            onChange={update("qualifications")}
            placeholder={"One per line, e.g.\nB.Tech in Computer Science, 2024"}
          />
          <div className="field-hint">One qualification per line.</div>
        </div>
        <div className="field">
          <label>Work experience</label>
          <textarea
            value={form.work_experience}
            onChange={update("work_experience")}
            placeholder={"One per line, e.g.\nIntern, Data Analytics Team, 2023"}
          />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Skills</label>
            <textarea value={form.skills} onChange={update("skills")} placeholder={"One per line"} />
          </div>
          <div className="field">
            <label>Interests</label>
            <textarea value={form.interests} onChange={update("interests")} placeholder={"One per line"} />
          </div>
        </div>
        <div className="field">
          <label>Certificates</label>
          <textarea
            value={form.certificates}
            onChange={update("certificates")}
            placeholder={"One per line, e.g.\nAWS Cloud Practitioner, 2024"}
          />
        </div>
        <button className="btn btn-primary" type="submit">
          Save profile
        </button>
      </form>
    </>
  );
}
