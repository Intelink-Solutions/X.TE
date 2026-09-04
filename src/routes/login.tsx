import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    try {
      await login({ email: String(data.get("email")), password: String(data.get("password")) });
      toast.success("Welcome back");
      await navigate({ to: "/news-feed" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthScreen title="Welcome back" subtitle="Sign in to like, comment and upload music.">
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="login-email">Email</Label>
          <Input id="login-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <span className="flex items-center justify-between gap-3">
            <Label htmlFor="login-password">Password</Label>
            <a
              href="/admin/forgot-password"
              className="text-xs font-semibold text-gold hover:underline"
            >
              Forgot password?
            </a>
          </span>
          <Input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </div>
        <Button
          disabled={pending}
          className="mt-2 rounded-full bg-gradient-gold font-bold text-primary-foreground"
        >
          <LogIn className="mr-2 h-4 w-4" />
          {pending ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        New to X&apos;Touch?{" "}
        <Link to="/register" className="font-semibold text-gold">
          Create an account
        </Link>
      </p>
    </AuthScreen>
  );
}
