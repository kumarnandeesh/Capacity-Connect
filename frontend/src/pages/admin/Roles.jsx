import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Alert, EmptyState } from "../../components/UI";

export default function Roles() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = () => api.get("/admin/users?status=approved", token).then(setUsers).catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [token]);

  const changeRole = async (id, role) => {
    setError("");
    setMessage("");
    try {
      await api.put(`/admin/users/${id}/role`, { role }, token);
      setMessage("Role updated.");
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader title="Role Management" subtitle="Change a user's role between trainee, trainer, and admin." />
      <Alert type="error">{error}</Alert>
      <Alert type="success">{message}</Alert>
      {users.length === 0 ? (
        <EmptyState>No approved users yet.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current role</th>
                <th>Change to</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => changeRole(u.id, e.target.value)}
                      style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--line)" }}
                    >
                      <option value="trainee">Trainee</option>
                      <option value="trainer">Trainer</option>
                      <option value="admin">Admin</option>
                    </select>
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
