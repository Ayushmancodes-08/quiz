"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseAuth } from "@/hooks/use-supabase-auth";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Logo from "../shared/logo";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const signupSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters long."}),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
});


export default function AuthForm() {
  const [isLogin, setIsLogin] = React.useState(true);
  const { loading, signInWithEmail, signUpWithEmail, signInWithGoogle } = useSupabaseAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema> | z.infer<typeof signupSchema>>({
    resolver: zodResolver(isLogin ? loginSchema : signupSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isLogin ? {} : { displayName: "" })
    }
  });

  React.useEffect(() => {
    form.reset();
  }, [isLogin, form]);

  const onSubmit = React.useCallback(async (data: z.infer<typeof loginSchema> | z.infer<typeof signupSchema>) => {
    try {
      if (isLogin) {
        const { email, password } = data as z.infer<typeof loginSchema>;
        await signInWithEmail(email, password);
      } else {
        const { email, password, displayName } = data as z.infer<typeof signupSchema>;
        await signUpWithEmail(email, password, displayName);

        toast({
          title: "Account Created!",
          description: "You can now log in with your new credentials.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "An unknown error occurred.",
      });
    }
  }, [isLogin, signInWithEmail, signUpWithEmail, toast]);

  const onGoogleSignIn = React.useCallback(async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: error.message || "Could not sign in with Google.",
      });
    }
  }, [signInWithGoogle, toast]);

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <Logo className="mx-auto text-4xl" />
        <h1 className="text-2xl font-semibold tracking-tight font-headline">
          {isLogin ? "Welcome Back" : "Create an Account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Enter your credentials to access your account" : "Enter your details to get started"}
        </p>
      </div>
      <div className="grid gap-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4">
            {!isLogin && (
               <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="John Doe"
                  type="text"
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect="off"
                  disabled={loading}
                  {...register("displayName")}
                />
                {errors?.displayName && (
                  <p className="px-1 text-xs text-destructive">{(errors as any).displayName.message}</p>
                )}
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={loading}
                {...register("email")}
              />
              {errors?.email && (
                <p className="px-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                disabled={loading}
                {...register("password")}
              />
               {errors?.password && (
                <p className="px-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <Button variant="outline" type="button" disabled={loading} onClick={onGoogleSignIn}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
            </svg>
          )}{" "}
          Google
        </Button>
        <p className="px-8 text-center text-sm text-muted-foreground">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="underline underline-offset-4 hover:text-primary"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </p>
      </div>
    </>
  );
}
