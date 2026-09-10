import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

export default function AdminCourses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subject: "", trainer_id: "" });
  const [error, setError] = useState("");

  const load = () => api.get("/admin/courses", token).then(setCourses).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    api.get("/admin/users?role=trainer&status=approved", token).then(setTrainers).catch(() => {});
  }, [token]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/courses", form, token);
      setForm({ title: "", description: "", subject: "", trainer_id: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="Courses Oversight"
        subtitle="Monitor all courses on the platform, and create or assign new ones."
        action={
          <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "New course"}
          </button>
        }
      />
      <Alert>{error}</Alert>

      {showForm && (
        <form className="panel" onSubmit={create} style={{ maxWidth: 520 }}>
          <div className="field">
            <label>Title</label>
            <input value={form.title} onChange={update("title")} required />
          </div>
          <div className="field">
            <label>Subject</label>
            <input value={form.subject} onChange={update("subject")} required />
          </div>
          <div className="field">
            <label>Assign trainer</label>
            <select value={form.trainer_id} onChange={update("trainer_id")}>
              <option value="">Unassigned</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Description</label>
            <textarea value={form.description} onChange={update("description")} />
          </div>
          <button className="btn btn-primary" type="submit">
            Create course
          </button>
        </form>
      )}

      {courses.length === 0 ? (
        <EmptyState>No courses on the platform yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Subject</th>
                <th>Trainer</th>
                <th>Enrolled</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.subject}</td>
                  <td>{c.trainer_name || "Unassigned"}</td>
                  <td>{c.enrolled_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
