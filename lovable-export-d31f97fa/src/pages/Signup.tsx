import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { SEOHead } from "@/components/seo/SEOHead";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, {
  message: "Passwords do not match",
  path: ["password_confirmation"],
});

type SignupInput = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup, clearError, error: authError } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", password_confirmation: "" },
  });

  const onSubmit = async (data: Required<SignupInput>) => {
    setSubmitting(true);
    try {
      await signup(data);
      setEmailSent(true);
      toast({ title: "Verification email sent", description: "Please check your inbox to verify your email address." });
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <>
        <SEOHead title="Verify Email" noindex />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="text-2xl font-bold">Check Your Email</h1>
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to your email. Click the link to activate your account.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Sign Up" description="Create your UpgradedProxy account." noindex />
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-8"
          noValidate
        >
          <h1 className="text-2xl font-bold">Create Account</h1>

          {authError && <ErrorBanner message={authError} onDismiss={clearError} />}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirm Password</Label>
            <Input id="password_confirmation" type="password" autoComplete="new-password" aria-invalid={!!errors.password_confirmation} {...register("password_confirmation")} />
            {errors.password_confirmation && <p className="text-xs text-destructive">{errors.password_confirmation.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? "Creating account…" : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </form>
      </div>
    </>
  );
}
