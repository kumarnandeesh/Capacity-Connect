import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_BY_ROLE = {
  trainee: [
    { to: "/trainee/home", label: "Home" },
    { to: "/trainee/profile", label: "My Profile" },
    { to: "/trainee/browse", label: "Browse Courses" },
    { to: "/trainee/my-courses", label: "My Courses" },
    { to: "/trainee/assessments", label: "Assessments" },
    { to: "/trainee/results", label: "My Results" },
  ],
  trainer: [
    { to: "/trainer/home", label: "Home" },
    { to: "/trainer/profile", label: "My Profile" },
    { to: "/trainer/courses", label: "My Courses" },
    { to: "/trainer/questionnaires", label: "Questionnaires" },
    { to: "/trainer/performance", label: "Trainee Performance" },
    { to: "/trainer/feedback", label: "Feedback Received" },
  ],
  admin: [
    { to: "/admin/home", label: "Dashboard" },
    { to: "/admin/approvals", label: "User Approvals" },
    { to: "/admin/roles", label: "Role Management" },
    { to: "/admin/courses", label: "Courses Oversight" },
    { to: "/admin/competency", label: "Competency Mapping" },
    { to: "/admin/notifications", label: "Announcements" },
  ],
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const links = NAV_BY_ROLE[user?.role] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          Capacity Connect
          <span>Digital capacity building &amp; LMS</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ width: "100%" }}>
            Log out
          </button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
