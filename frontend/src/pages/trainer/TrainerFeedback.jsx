import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState } from "../../components/UI";

export default function TrainerFeedback() {
  const { token } = useAuth();
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    api.get("/trainer/feedback", token).then(setFeedback).catch(() => {});
  }, [token]);

  return (
    <>
      <PageHeader title="Feedback Received" subtitle="What trainees are saying about your courses." />
      {feedback.length === 0 ? (
        <EmptyState>No feedback received yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Trainee</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((f) => (
                <tr key={f.id}>
                  <td>{f.course_title}</td>
                  <td>{f.trainee_name}</td>
                  <td>{"★".repeat(f.rating)}{"☆".repeat(5 - f.rating)}</td>
                  <td>{f.comment}</td>
                  <td>{new Date(f.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
