import AuthForm from '@/components/auth/auth-form';
import Logo from '@/components/shared/logo';

export default function AuthPage() {
  return (
    <div className="container relative flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-2 text-center">
          <Logo className="mx-auto text-4xl" />
          <h1 className="text-2xl font-semibold tracking-tight font-headline">
            Welcome to the Grid
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to connect or sign up
          </p>
        </div>
        <AuthForm />
      </div>
    </div>
  );
}
