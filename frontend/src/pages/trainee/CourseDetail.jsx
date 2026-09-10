import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

export default function CourseDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/trainee/courses/${id}/materials`, token).then(setMaterials).catch((e) => setError(e.message));
  }, [id, token]);

  const submitFeedback = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post(`/trainee/courses/${id}/feedback`, { rating: Number(rating), comment }, token);
      setMessage("Thanks — your feedback was submitted.");
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <PageHeader title="Course Library" subtitle="Recorded lectures, presentations, and study material for this course." />
      <div className="panel">
        <h3>Trainer library</h3>
        {materials.length === 0 ? (
          <EmptyState>No materials uploaded yet for this course.</EmptyState>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Uploaded</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id}>
                  <td>{m.title}</td>
                  <td>{m.type}</td>
                  <td>{new Date(m.uploaded_at).toLocaleDateString()}</td>
                  <td>
                    <a className="btn btn-ghost btn-sm" href={api.fileUrl(m.file_path) + `?token=${token}`} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <form className="panel" onSubmit={submitFeedback} style={{ maxWidth: 480 }}>
        <h3>Leave feedback for this course</h3>
        <Alert type="error">{error}</Alert>
        <Alert type="success">{message}</Alert>
        <div className="field">
          <label>Rating</label>
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "star" : "stars"}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Comments</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What worked well? What could improve?" />
        </div>
        <button className="btn btn-primary" type="submit">
          Submit feedback
        </button>
      </form>

      <Link to="/trainee/my-courses">&larr; Back to my courses</Link>
    </>
  );
}
