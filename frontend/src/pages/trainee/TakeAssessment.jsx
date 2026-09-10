import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert } from "../../components/UI";

const OPTION_KEYS = ["a", "b", "c", "d"];

export default function TakeAssessment() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get(`/trainee/assessments/${id}`, token)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [id, token]);

  const choose = (questionId, opt) => setAnswers({ ...answers, [questionId]: opt });

  const submit = async () => {
    setError("");
    try {
      const payload = {
        answers: Object.entries(answers).map(([question_id, selected_option]) => ({
          question_id,
          selected_option,
        })),
      };
      const res = await api.post(`/trainee/assessments/${id}/submit`, payload, token);
      setResult(res);
    } catch (e) {
      setError(e.message);
    }
  };

  if (error && !data) return <Alert>{error}</Alert>;
  if (!data) return <p>Loading assessment...</p>;

  if (result) {
    return (
      <>
        <PageHeader title={data.questionnaire.title} subtitle="Assessment submitted" />
        <div className="panel" style={{ maxWidth: 420, textAlign: "center" }}>
          <h2 style={{ color: "var(--forest)" }}>
            {result.score} / {result.total}
          </h2>
          <p>Your response has been recorded. You can review your full history under My Results.</p>
          <button className="btn btn-primary" onClick={() => navigate("/trainee/results")}>
            View my results
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={data.questionnaire.title} subtitle={`Subject: ${data.questionnaire.subject}`} />
      <Alert>{error}</Alert>
      {data.questions.map((q, idx) => (
        <div className="panel" key={q.id}>
          <h3>
            {idx + 1}. {q.question_text}
          </h3>
          {OPTION_KEYS.map((k) => (
            <div
              key={k}
              className={"quiz-option" + (answers[q.id] === k ? " selected" : "")}
              onClick={() => choose(q.id, k)}
            >
              <input type="radio" readOnly checked={answers[q.id] === k} />
              <span>{q[`option_${k}`]}</span>
            </div>
          ))}
        </div>
      ))}
      <button
        className="btn btn-primary"
        onClick={submit}
        disabled={Object.keys(answers).length !== data.questions.length}
      >
        Submit assessment
      </button>
    </>
  );
}
