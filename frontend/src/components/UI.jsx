export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="main-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatBox({ value, label }) {
  return (
    <div className="stat-box">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const cls =
    status === "approved" ? "badge-approved" : status === "rejected" ? "badge-rejected" : "badge-pending";
  return <span className={`badge ${cls}`}>{status}</span>;
}

export function Alert({ type = "error", children }) {
  if (!children) return null;
  return <div className={`alert alert-${type}`}>{children}</div>;
}

export function EmptyState({ children }) {
  return <div className="empty-state">{children}</div>;
}

export function NotificationFeed({ items }) {
  if (!items || items.length === 0) {
    return <EmptyState>No announcements yet.</EmptyState>;
  }
  return (
    <div>
      {items.map((n) => (
        <div className="feed-item" key={n.id}>
          <div className="feed-tag">{n.type}</div>
          <div className="feed-body">
            <strong>{n.title}</strong>
            <p style={{ margin: "2px 0" }}>{n.message}</p>
            <span>{new Date(n.created_at).toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
