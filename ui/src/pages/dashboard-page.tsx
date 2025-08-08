import { useAuth } from '../lib/auth-context';

export function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={logout}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
        >
          Logout
        </button>
      </div>

      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Welcome, {user?.name || user?.email}</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
            <p>{user?.email}</p>
          </div>

          {user?.name && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
              <p>{user.name}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground">User ID</h3>
            <p className="font-mono text-xs">{user?.id}</p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="mb-4 text-lg font-semibold">Your Subscriptions</h3>
          <div className="rounded-md bg-muted p-4 text-center text-muted-foreground">
            <p>No subscriptions yet.</p>
            <p className="mt-2 text-sm">
              <a href="/subscriptions/new" className="text-primary hover:underline">
                Add your first subscription
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
