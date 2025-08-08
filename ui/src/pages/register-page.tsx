import { RegisterForm } from '../components/auth/register-form';

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
