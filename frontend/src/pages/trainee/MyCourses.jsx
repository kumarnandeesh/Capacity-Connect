import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState } from "../../components/UI";

export default function MyCourses() {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get("/trainee/my-courses", token).then(setCourses).catch(() => {});
  }, [token]);

  return (
    <>
      <PageHeader title="My Courses" subtitle="Courses you're enrolled in." />
      {courses.length === 0 ? (
        <EmptyState>
          You haven't enrolled in any courses yet. Visit <Link to="/trainee/browse">Browse Courses</Link>.
        </EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Course</th>
                <th>Trainer</th>
                <th>Enrolled on</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>
                    <strong>{c.title}</strong>
                  </td>
                  <td>{c.trainer_name || "Unassigned"}</td>
                  <td>{new Date(c.enrolled_at).toLocaleDateString()}</td>
                  <td>
                    <Link className="btn btn-ghost btn-sm" to={`/trainee/my-courses/${c.id}`}>
                      Open
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
