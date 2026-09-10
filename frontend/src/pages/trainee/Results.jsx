import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState } from "../../components/UI";

export default function Results() {
  const { token } = useAuth();
  const [results, setResults] = useState([]);

  useEffect(() => {
    api.get("/trainee/results", token).then(setResults).catch(() => {});
  }, [token]);

  return (
    <>
      <PageHeader title="My Results" subtitle="Your assessment history across all courses." />
      {results.length === 0 ? (
        <EmptyState>You haven't attempted any assessments yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Course</th>
                <th>Subject</th>
                <th>Score</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.id}>
                  <td>{r.assessment_title}</td>
                  <td>{r.course_title}</td>
                  <td>{r.subject}</td>
                  <td>
                    {r.score} / {r.total}
                  </td>
                  <td>{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
