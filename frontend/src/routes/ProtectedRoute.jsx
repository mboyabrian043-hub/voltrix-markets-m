import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = () => {
  const { isAuthenticated, token } = useAuth();

  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
