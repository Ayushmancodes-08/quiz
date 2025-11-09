import AuthForm from '@/components/auth/auth-form';
import Logo from '@/components/shared/logo';

export default function AuthPage() {
  return (
    <div className="container relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <AuthForm />
      </div>
    </div>
  );
}
