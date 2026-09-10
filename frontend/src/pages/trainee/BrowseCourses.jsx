import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

export default function BrowseCourses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => api.get("/trainee/courses", token).then(setCourses).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [token]);

  const enroll = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await api.post(`/trainee/courses/${id}/enroll`, {}, token);
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader title="Browse Courses" subtitle="Explore available courses and enroll to access materials and assessments." />
      <Alert>{error}</Alert>
      {courses.length === 0 ? (
        <EmptyState>No courses have been published yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Subject</th>
                <th>Trainer</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.title}</strong>
                    <div style={{ fontSize: 12, color: "var(--slate)" }}>{c.description}</div>
                  </td>
                  <td>{c.subject}</td>
                  <td>{c.trainer_name || "Unassigned"}</td>
                  <td>
                    {c.is_enrolled ? (
                      <span className="badge badge-approved">Enrolled</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={busyId === c.id}
                        onClick={() => enroll(c.id)}
                      >
                        Enroll
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
