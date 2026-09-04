import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthScreen } from "@/components/auth/AuthScreen";

export const Route = createFileRoute("/register")({ component: RegisterPage });

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password"));
    const confirmation = String(data.get("password_confirmation"));
    const name = String(data.get("name")).trim();
    const email = String(data.get("email")).trim().toLowerCase();
    if (password !== confirmation) return toast.error("Passwords do not match");
    setPending(true);
    try {
      await register({ name, email, password, password_confirmation: confirmation });
      toast.success("Your account is ready");
      await navigate({ to: "/news-feed" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthScreen
      title="Join X'Touch"
      subtitle="Create an account to like, comment and submit your music."
    >
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="register-name">Display name</Label>
          <Input id="register-name" name="name" required maxLength={100} autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="register-email">Email</Label>
          <Input id="register-email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="register-password">Password</Label>
          <Input
            id="register-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="register-confirm">Confirm password</Label>
          <Input
            id="register-confirm"
            name="password_confirmation"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <Button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-gradient-gold font-bold text-primary-foreground"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-gold">
          Sign in
        </Link>
      </p>
    </AuthScreen>
  );
}
