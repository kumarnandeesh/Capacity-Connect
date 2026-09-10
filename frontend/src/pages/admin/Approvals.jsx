import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, EmptyState, StatusBadge, Alert } from "../../components/UI";

export default function Approvals() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");

  const load = () =>
    api
      .get(`/admin/users${filter ? `?status=${filter}` : ""}`, token)
      .then(setUsers)
      .catch((e) => setError(e.message));

  useEffect(() => {
    load();
  }, [token, filter]);

  const act = async (id, action) => {
    setError("");
    try {
      await api.post(`/admin/users/${id}/${action}`, {}, token);
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <PageHeader title="User Approvals" subtitle="Review and approve new trainee and trainer accounts." />
      <div className="tabs">
        {["pending", "approved", "rejected", ""].map((s) => (
          <button key={s || "all"} className={"tab" + (filter === s ? " active" : "")} onClick={() => setFilter(s)}>
            {s ? s[0].toUpperCase() + s.slice(1) : "All"}
          </button>
        ))}
      </div>
      <Alert>{error}</Alert>
      {users.length === 0 ? (
        <EmptyState>No users in this view.</EmptyState>
      ) : (
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                  <td>
                    <StatusBadge status={u.status} />
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {u.status !== "approved" && (
                      <button className="btn btn-primary btn-sm" onClick={() => act(u.id, "approve")}>
                        Approve
                      </button>
                    )}
                    {u.status !== "rejected" && (
                      <button className="btn btn-danger btn-sm" onClick={() => act(u.id, "reject")}>
                        Reject
                      </button>
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
