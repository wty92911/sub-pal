import { LoginForm } from '../components/auth/login-form';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
