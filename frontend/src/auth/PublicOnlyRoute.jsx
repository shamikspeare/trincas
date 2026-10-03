import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function PublicOnlyRoute({ children }) {
  const { session, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-gray-50" />;
  return session ? <Navigate to="/dashboard" replace /> : children;
}
