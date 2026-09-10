import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

const emptyQuestion = () => ({
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "a",
});

export default function Questionnaires() {
  const { token } = useAuth();
  const [list, setList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ course_id: "", title: "", subject: "", deadline: "" });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/trainer/questionnaires", token).then(setList).catch((e) => setError(e.message));

  useEffect(() => {
    load();
    api.get("/trainer/courses", token).then(setCourses).catch(() => {});
  }, [token]);

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const updateQ = (i, k) => (e) => {
    const next = [...questions];
    next[i] = { ...next[i], [k]: e.target.value };
    setQuestions(next);
  };
  const addQuestion = () => setQuestions([...questions, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(questions.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.post(
        "/trainer/questionnaires",
        {
          course_id: form.course_id,
          title: form.title,
          subject: form.subject,
          deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
          questions,
        },
        token
      );
      setForm({ course_id: "", title: "", subject: "", deadline: "" });
      setQuestions([emptyQuestion()]);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Questionnaires"
        subtitle="Create subject-wise MCQ assessments with deadlines for your courses."
        action={
          <button className="btn btn-accent" onClick={() => setShowForm((s) => !s)}>
            {showForm ? "Cancel" : "New questionnaire"}
          </button>
        }
      />
      <Alert>{error}</Alert>

      {showForm && (
        <form className="panel" onSubmit={submit}>
          <div className="form-row">
            <div className="field">
              <label>Course</label>
              <select value={form.course_id} onChange={update("course_id")} required>
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Subject</label>
              <input value={form.subject} onChange={update("subject")} required />
            </div>
          </div>
          <div className="form-row">
            <div className="field">
              <label>Title</label>
              <input value={form.title} onChange={update("title")} required />
            </div>
            <div className="field">
              <label>Deadline</label>
              <input type="datetime-local" value={form.deadline} onChange={update("deadline")} />
            </div>
          </div>

          <h3>Questions</h3>
          {questions.map((q, i) => (
            <div className="question-card" key={i}>
              <div className="field">
                <label>Question {i + 1}</label>
                <input value={q.question_text} onChange={updateQ(i, "question_text")} required />
              </div>
              <div className="options-grid">
                <div className="field">
                  <label>Option A</label>
                  <input value={q.option_a} onChange={updateQ(i, "option_a")} required />
                </div>
                <div className="field">
                  <label>Option B</label>
                  <input value={q.option_b} onChange={updateQ(i, "option_b")} required />
                </div>
                <div className="field">
                  <label>Option C</label>
                  <input value={q.option_c} onChange={updateQ(i, "option_c")} required />
                </div>
                <div className="field">
                  <label>Option D</label>
                  <input value={q.option_d} onChange={updateQ(i, "option_d")} required />
                </div>
              </div>
              <div className="field" style={{ maxWidth: 200 }}>
                <label>Correct option</label>
                <select value={q.correct_option} onChange={updateQ(i, "correct_option")}>
                  <option value="a">A</option>
                  <option value="b">B</option>
                  <option value="c">C</option>
                  <option value="d">D</option>
                </select>
              </div>
              {questions.length > 1 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(i)}>
                  Remove question
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-ghost" onClick={addQuestion} style={{ marginBottom: 16 }}>
            + Add another question
          </button>
          <br />
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? "Publishing..." : "Publish questionnaire"}
          </button>
        </form>
      )}

      {list.length === 0 ? (
        <EmptyState>You haven't created any questionnaires yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Deadline</th>
                <th>Submissions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((q) => (
                <tr key={q.id}>
                  <td>{q.title}</td>
                  <td>{q.course_title}</td>
                  <td>{q.deadline ? new Date(q.deadline).toLocaleString() : "No deadline"}</td>
                  <td>{q.submission_count}</td>
                  <td>
                    <Link className="btn btn-ghost btn-sm" to={`/trainer/questionnaires/${q.id}`}>
                      View results
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
