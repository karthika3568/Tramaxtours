import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Loading from '../components/ui/Loading';
import { ADMIN_ROLES, isAdminRole } from '../utils/roles';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isLoading, role, roles } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loading fullPage message="Authenticating session..." />;
  }

  const isAdminRoute = adminOnly || location.pathname.startsWith('/admin');

  if (!isAuthenticated) {
    const redirectUrl = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectUrl)}`} state={{ from: location }} replace />;
  }

  // Strict RBAC boundary: Customers must NEVER access admin portal routes
  if (isAdminRoute) {
    const hasAdminAccess = isAdminRole(role) || (roles && roles.some((r) => ADMIN_ROLES.includes(r)));
    if (!hasAdminAccess) {
      return <Navigate to="/403" state={{ from: location }} replace />;
    }
  }

  return children ? children : <Outlet />;
}
