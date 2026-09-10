import { useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

export default function Competency() {
  const { token } = useAuth();
  const [subject, setSubject] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const search = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.get(`/admin/competency-mapping?subject=${encodeURIComponent(subject)}`, token);
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Competency Mapping"
        subtitle="Find the most suitable trainer for a subject, ranked by tagged expertise, experience, and feedback ratings."
      />
      <form className="panel" onSubmit={search} style={{ maxWidth: 480 }}>
        <div className="field">
          <label>Subject</label>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Networking" required />
        </div>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Searching..." : "Find suitable trainers"}
        </button>
      </form>

      <Alert>{error}</Alert>

      {result && (
        <div className="panel">
          <h3 style={{ marginBottom: 14 }}>Ranked trainers for "{result.subject}"</h3>
          {result.ranked_trainers.length === 0 ? (
            <EmptyState>No approved trainers found.</EmptyState>
          ) : (
            result.ranked_trainers.map((t) => (
              <div className="rank-row" key={t.id}>
                <div>
                  <strong>{t.name}</strong>
                  <div style={{ fontSize: 12, color: "var(--slate)" }}>
                    {t.subjects.join(", ") || "No subjects tagged"} &middot; {t.years_experience} yrs exp &middot;{" "}
                    {t.avg_rating ? `${t.avg_rating}★ (${t.feedback_count} reviews)` : "No feedback yet"} &middot;{" "}
                    {t.courses_taught} courses taught
                    {t.direct_subject_match && " · Direct subject match"}
                  </div>
                </div>
                <div className="match-score">{t.match_score}</div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}
