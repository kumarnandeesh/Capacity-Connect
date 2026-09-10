import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState, StatBox } from "../../components/UI";

export default function Performance() {
  const { token } = useAuth();
  const [questionnaires, setQuestionnaires] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/trainer/questionnaires", token).then(setQuestionnaires).catch(() => {});
    api.get("/trainer/courses", token).then(setCourses).catch(() => {});
  }, [token]);

  const totalEnrolled = courses.reduce((s, c) => s + (c.enrolled_count || 0), 0);
  const totalSubmissions = questionnaires.reduce((s, q) => s + (q.submission_count || 0), 0);

  return (
    <>
      <PageHeader title="Trainee Performance" subtitle="Participation and assessment performance across your courses." />

      <div className="stat-grid">
        <StatBox value={courses.length} label="Courses" />
        <StatBox value={totalEnrolled} label="Total participants" />
        <StatBox value={questionnaires.length} label="Assessments created" />
        <StatBox value={totalSubmissions} label="Assessment submissions" />
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 14 }}>By course</h3>
        {courses.length === 0 ? (
          <EmptyState>No courses yet.</EmptyState>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Enrolled trainees</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.enrolled_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 14 }}>By assessment</h3>
        {questionnaires.length === 0 ? (
          <EmptyState>No assessments created yet.</EmptyState>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Course</th>
                <th>Submissions</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {questionnaires.map((q) => (
                <tr key={q.id}>
                  <td>{q.title}</td>
                  <td>{q.course_title}</td>
                  <td>{q.submission_count}</td>
                  <td>
                    <Link className="btn btn-ghost btn-sm" to={`/trainer/questionnaires/${q.id}`}>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
