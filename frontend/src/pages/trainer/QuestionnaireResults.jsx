import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState } from "../../components/UI";

export default function QuestionnaireResults() {
  const { id } = useParams();
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get(`/trainer/questionnaires/${id}/results`, token).then(setData).catch(() => {});
  }, [id, token]);

  if (!data) return <p>Loading...</p>;

  return (
    <>
      <PageHeader title={data.questionnaire.title} subtitle={`Subject: ${data.questionnaire.subject}`} />
      {data.results.length === 0 ? (
        <EmptyState>No trainees have attempted this assessment yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Trainee</th>
                <th>Email</th>
                <th>Score</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {data.results.map((r) => (
                <tr key={r.id}>
                  <td>{r.trainee_name}</td>
                  <td>{r.trainee_email}</td>
                  <td>
                    {r.score} / {r.total}
                  </td>
                  <td>{new Date(r.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link to="/trainer/questionnaires">&larr; Back to questionnaires</Link>
    </>
  );
}
