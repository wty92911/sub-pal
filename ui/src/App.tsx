import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-context';
import { LoginPage } from './pages/login-page';
import { RegisterPage } from './pages/register-page';
import { DashboardPage } from './pages/dashboard-page';
import { SubscriptionPage } from './pages/subscription-page';
import { AddSubscriptionPage } from './pages/add-subscription-page';
import { StatisticsPage } from './pages/statistics-page';
import { ProtectedRoute } from './components/auth/protected-route';
import { ErrorBoundary } from './components/ui/error-boundary';

// Root redirect component that handles authentication state
function RootRedirect() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (user && location.pathname === '/') {
        navigate('/dashboard');
      } else if (!user && location.pathname === '/') {
        navigate('/login');
      }
    }
  }, [user, isLoading, navigate, location.pathname]);

  return null;
}

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleError = useCallback((error: Error, errorInfo: any) => {
    // Log error to console in development
    console.error('App Error:', error, errorInfo);

    // In production, you would send this to an error reporting service
    // errorReportingService.logError(error, errorInfo);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  return (
    <ErrorBoundary onError={handleError}>
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-background text-foreground">
          <AuthProvider>
            <Router>
              <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<SubscriptionPage />} />
                <Route path="/subscriptions/new" element={<AddSubscriptionPage />} />
                <Route path="/subscriptions/edit/:id" element={<AddSubscriptionPage />} />
                <Route path="/subscriptions/:id" element={<AddSubscriptionPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                {/* Legacy dashboard route */}
                <Route path="/legacy-dashboard" element={<DashboardPage />} />
              </Route>

              {/* Root path handler */}
              <Route path="/" element={<RootRedirect />} />

              {/* Catch-all route for 404s */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>

        {/* Theme toggle button */}
        <div className="fixed bottom-4 right-4 z-[100]">
          <button
            onClick={toggleDarkMode}
            className="rounded-full bg-primary p-2 text-primary-foreground shadow-sm hover:bg-primary/90"
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
