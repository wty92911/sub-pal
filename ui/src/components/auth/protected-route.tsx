import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/auth-context';

/**
 * A route wrapper that redirects to the login page if the user is not authenticated
 */
export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const isAuthenticated = !!user;

  // Show a loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render the child routes
  return <Outlet />;
}
