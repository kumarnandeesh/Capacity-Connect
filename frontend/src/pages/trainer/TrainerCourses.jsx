import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

export default function TrainerCourses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", subject: "" });
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get("/trainer/courses", token).then(setCourses).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [token]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/trainer/courses", form, token);
      setForm({ title: "", description: "", subject: "" });
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader
        title="My Courses"
        subtitle="Create courses and manage their materials, questionnaires, and participants."
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
            <input value={form.subject} onChange={update("subject")} required placeholder="e.g. Networking" />
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
        <EmptyState>You haven't created any courses yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Subject</th>
                <th>Enrolled</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.title}</strong>
                  </td>
                  <td>{c.subject}</td>
                  <td>{c.enrolled_count}</td>
                  <td>
                    <Link className="btn btn-ghost btn-sm" to={`/trainer/courses/${c.id}`}>
                      Manage
                    </Link>
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
