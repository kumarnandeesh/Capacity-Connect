import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState } from "../../components/UI";

export default function Assessments() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/trainee/assessments", token).then(setItems).catch(() => {});
  }, [token]);

  const isPastDeadline = (d) => d && new Date() > new Date(d);

  return (
    <>
      <PageHeader title="Assessments" subtitle="Subject-wise MCQ assessments for your enrolled courses." />
      {items.length === 0 ? (
        <EmptyState>No assessments available yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Course</th>
                <th>Subject</th>
                <th>Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.course_title}</td>
                  <td>{a.subject}</td>
                  <td>{a.deadline ? new Date(a.deadline).toLocaleDateString() : "No deadline"}</td>
                  <td>
                    {a.attempted ? (
                      <span className="badge badge-approved">Completed</span>
                    ) : isPastDeadline(a.deadline) ? (
                      <span className="badge badge-rejected">Closed</span>
                    ) : (
                      <Link className="btn btn-primary btn-sm" to={`/trainee/assessments/${a.id}`}>
                        Attempt
                      </Link>
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
