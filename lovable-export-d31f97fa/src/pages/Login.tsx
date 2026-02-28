import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable/index";
import { SEOHead } from "@/components/seo/SEOHead";
import { ErrorBanner } from "@/components/shared/ErrorBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, Smartphone } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, clearError, error: authError } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: Required<LoginInput>) => {
    setSubmitting(true);
    try {
      const result = await login(data);
      if (result && 'requires_2fa' in result && result.requires_2fa) {
        // Stay on page, AuthContext will trigger 2FA UI
        return;
      }
      const user = result as any;
      const defaultNext = user.role === 'admin' ? "/admin" : "/app";
      navigate(params.get("next") ?? defaultNext, { replace: true });
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const [otpCode, setOtpCode] = useState("");
  const { verify2fa, is2FAPending } = useAuth();

  const handleVerify2fa = async () => {
    if (otpCode.length !== 6) return;
    setSubmitting(true);
    try {
      const user = await verify2fa(otpCode);
      const defaultNext = user.role === 'admin' ? "/admin" : "/app";
      navigate(params.get("next") ?? defaultNext, { replace: true });
    } catch {
      // error is set in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <>
      <SEOHead title="Login" description="Sign in to your UpgradedProxy account." noindex />
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-8"
          noValidate
        >
          <h1 className="text-2xl font-bold">Login</h1>

          {authError && <ErrorBanner message={authError} onDismiss={clearError} />}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
            {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? "Signing in…" : "Sign In"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">Or continue with</span></div>
          </div>

          <Button type="button" variant="outline" className="w-full gap-2" onClick={handleGoogleSignIn}>
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
            Sign in with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
          </p>
        </form>

        {is2FAPending && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-sm space-y-6 rounded-lg border bg-card p-8 shadow-lg">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold">Secure Login</h2>
                <p className="text-sm text-muted-foreground text-pretty">
                  {isRecoveryMode
                    ? "Enter one of your 13-character recovery codes."
                    : "Enter the 6-digit verification code from your authenticator app."}
                </p>
              </div>

              <div className="flex flex-col items-center space-y-6">
                <div className="w-full flex justify-center">
                  {!isRecoveryMode ? (
                    <InputOTP
                      maxLength={6}
                      value={otpCode}
                      onChange={setOtpCode}
                      autoFocus
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="w-10 h-14 text-xl border-2" />
                        <InputOTPSlot index={1} className="w-10 h-14 text-xl border-2" />
                        <InputOTPSlot index={2} className="w-10 h-14 text-xl border-2" />
                        <InputOTPSlot index={3} className="w-10 h-14 text-xl border-2" />
                        <InputOTPSlot index={4} className="w-10 h-14 text-xl border-2" />
                        <InputOTPSlot index={5} className="w-10 h-14 text-xl border-2" />
                      </InputOTPGroup>
                    </InputOTP>
                  ) : (
                    <Input
                      placeholder="000000-000000"
                      className="text-center text-lg font-mono tracking-widest h-14 uppercase"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      autoFocus
                    />
                  )}
                </div>

                <div className="w-full space-y-3">
                  <Button
                    className="w-full py-6 text-base font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    onClick={handleVerify2fa}
                    disabled={submitting || (isRecoveryMode ? otpCode.length < 10 : otpCode.length !== 6)}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-2 h-5 w-5" />
                    )}
                    Verify & Sign In
                  </Button>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="link"
                      className="text-xs text-primary/80"
                      onClick={() => {
                        setIsRecoveryMode(!isRecoveryMode);
                        setOtpCode("");
                      }}
                    >
                      {isRecoveryMode ? "Use authenticator app instead" : "Lost access? Use a recovery code"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-xs text-muted-foreground"
                      onClick={() => window.location.reload()}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
