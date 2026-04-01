import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contextProvider/authContext';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Ensure user has a role. If a legacy pre-RBAC student token lacks a role string natively, default to 'student'
  const userRole = user.role || 'student';

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
}
