import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

/**
 * A route wrapper that redirects to the login page if the user is not authenticated
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  // Show nothing while checking authentication
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render the child routes
  return <Outlet />;
}
