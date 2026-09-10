import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}/home`} replace />;

  return <Layout>{children}</Layout>;
}
