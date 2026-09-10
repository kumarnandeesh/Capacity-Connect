import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

const TYPES = [
  { value: "announcement", label: "Announcement" },
  { value: "notification", label: "Notification" },
  { value: "achievement", label: "Achievement" },
  { value: "content", label: "New content" },
];

export default function Notifications() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ type: "announcement", title: "", message: "" });
  const [error, setError] = useState("");

  const load = () => api.get("/admin/notifications", token).then(setItems).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [token]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const publish = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/admin/notifications", form, token);
      setForm({ type: "announcement", title: "", message: "" });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    await api.del(`/admin/notifications/${id}`, token);
    load();
  };

  return (
    <>
      <PageHeader title="Announcements" subtitle="Publish notifications, announcements, achievements, and new content to the homepage feed." />
      <form className="panel" onSubmit={publish} style={{ maxWidth: 520 }}>
        <Alert>{error}</Alert>
        <div className="field">
          <label>Type</label>
          <select value={form.type} onChange={update("type")}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Title</label>
          <input value={form.title} onChange={update("title")} required />
        </div>
        <div className="field">
          <label>Message</label>
          <textarea value={form.message} onChange={update("message")} />
        </div>
        <button className="btn btn-primary" type="submit">
          Publish
        </button>
      </form>

      {items.length === 0 ? (
        <EmptyState>Nothing published yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Published</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td style={{ textTransform: "capitalize" }}>{n.type}</td>
                  <td>{n.title}</td>
                  <td>{new Date(n.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(n.id)}>
                      Remove
                    </button>
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
