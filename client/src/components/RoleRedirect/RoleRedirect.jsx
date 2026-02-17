import { useAuth } from "../../contexts/AuthContext";
import { Navigate } from "react-router-dom";

function RoleRedirect() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") {
    return <Navigate to="/admindashboard" replace />;
  }

  if (user.role === "developer") {
    return <Navigate to="/developerdashboard" replace />;
  }

  if (user.role === "tester") {
    return <Navigate to="/testerdashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export default RoleRedirect;