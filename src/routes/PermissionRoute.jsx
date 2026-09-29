import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from '../components/ui/Loading';

export default function PermissionRoute({ permission, permissions, children }) {
  const { isAuthenticated, isLoading, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullPage message="Verifying permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  const required = permission || permissions;
  if (required && !hasPermission(required)) {
    return <Navigate to="/403" state={{ requiredPermission: required, from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
