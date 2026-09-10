import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

export default function TrainerCourseDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [tab, setTab] = useState("materials");
  const [materials, setMaterials] = useState([]);
  const [trainees, setTrainees] = useState([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("video");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadMaterials = () =>
    api.get(`/trainer/courses/${id}/materials`, token).then(setMaterials).catch((e) => setError(e.message));
  const loadTrainees = () =>
    api.get(`/trainer/courses/${id}/trainees`, token).then(setTrainees).catch((e) => setError(e.message));

  useEffect(() => {
    loadMaterials();
    loadTrainees();
  }, [id, token]);

  const upload = async (e) => {
    e.preventDefault();
    setError("");
    if (!file) return setError("Choose a file to upload");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title || file.name);
      fd.append("type", type);
      await api.postForm(`/trainer/courses/${id}/materials`, fd, token);
      setTitle("");
      setFile(null);
      loadMaterials();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Manage Course" subtitle="Upload materials for your trainee library, and monitor participation." />
      <div className="tabs">
        <button className={"tab" + (tab === "materials" ? " active" : "")} onClick={() => setTab("materials")}>
          Trainer Library
        </button>
        <button className={"tab" + (tab === "trainees" ? " active" : "")} onClick={() => setTab("trainees")}>
          Trainee Participation
        </button>
      </div>

      <Alert>{error}</Alert>

      {tab === "materials" && (
        <>
          <form className="panel" onSubmit={upload} style={{ maxWidth: 520 }}>
            <h3>Upload material</h3>
            <div className="form-row">
              <div className="field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Week 1 lecture" />
              </div>
              <div className="field">
                <label>Type</label>
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="video">Recorded lecture</option>
                  <option value="presentation">Presentation</option>
                  <option value="document">Study material</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label>File</label>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Uploading..." : "Upload"}
            </button>
          </form>

          {materials.length === 0 ? (
            <EmptyState>No materials uploaded yet.</EmptyState>
          ) : (
            <div className="panel">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((m) => (
                    <tr key={m.id}>
                      <td>{m.title}</td>
                      <td>{m.type}</td>
                      <td>{new Date(m.uploaded_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === "trainees" && (
        <div className="panel">
          {trainees.length === 0 ? (
            <EmptyState>No trainees enrolled yet.</EmptyState>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Trainee</th>
                  <th>Email</th>
                  <th>Enrolled on</th>
                </tr>
              </thead>
              <tbody>
                {trainees.map((t) => (
                  <tr key={t.id}>
                    <td>{t.name}</td>
                    <td>{t.email}</td>
                    <td>{new Date(t.enrolled_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <Link to="/trainer/courses">&larr; Back to my courses</Link>
    </>
  );
}
