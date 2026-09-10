import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, StatBox } from "../../components/UI";

export default function AdminHome() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard", token).then(setStats).catch(() => {});
  }, [token]);

  if (!stats) return <p>Loading dashboard...</p>;

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide monitoring across courses, enrollments, and assessments." />

      <div className="stat-grid">
        <StatBox value={stats.totalUsers} label="Total users" />
        <StatBox value={stats.totalTrainees} label="Trainees" />
        <StatBox value={stats.totalTrainers} label="Trainers" />
        <StatBox value={stats.pendingApprovals} label="Pending approvals" />
        <StatBox value={stats.totalCourses} label="Courses" />
        <StatBox value={stats.totalEnrollments} label="Enrollments" />
        <StatBox value={stats.totalAssessments} label="Assessments" />
        <StatBox value={stats.totalSubmissions} label="Submissions" />
        <StatBox value={`${stats.avgScorePct}%`} label="Avg. assessment score" />
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 14 }}>Courses by subject</h3>
        {stats.coursesBySubject.length === 0 ? (
          <p>No courses yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Courses</th>
              </tr>
            </thead>
            <tbody>
              {stats.coursesBySubject.map((s) => (
                <tr key={s.subject}>
                  <td>{s.subject}</td>
                  <td>{s.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <h3 style={{ marginBottom: 14 }}>Top courses by enrollment</h3>
        {stats.enrollmentsPerCourse.length === 0 ? (
          <p>No courses yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Enrollments</th>
              </tr>
            </thead>
            <tbody>
              {stats.enrollmentsPerCourse.map((c) => (
                <tr key={c.title}>
                  <td>{c.title}</td>
                  <td>{c.enrollments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
