import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { LoginPage } from './pages/login-page';
import { RegisterPage } from './pages/register-page';
import { DashboardPage } from './pages/dashboard-page';
import { SubscriptionPage } from './pages/subscription-page';
import { AddSubscriptionPage } from './pages/add-subscription-page';
import { StatisticsPage } from './pages/statistics-page';
import { ProtectedRoute } from './components/auth/protected-route';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
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

              {/* Redirect to dashboard if authenticated, otherwise to login */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>

        {/* Theme toggle button */}
        <div className="fixed bottom-4 right-4 z-[100]">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
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
    </div>
  );
}

export default App;
