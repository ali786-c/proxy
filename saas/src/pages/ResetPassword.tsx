import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/lib/api";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState(true); // Default true for Laravel flow

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      // Get token from URL if using traditional Laravel reset flow
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const email = urlParams.get('email');

      await api.post("/reset-password", {
        token,
        email,
        password,
        password_confirmation: confirm
      });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <>
        <SEOHead title="Password Updated" noindex />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="text-2xl font-bold">Password Updated</h1>
            <p className="text-sm text-muted-foreground">Your password has been successfully reset.</p>
            <Button className="w-full" onClick={() => navigate("/app", { replace: true })}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      </>
    );
  }

  if (!hasSession) {
    return (
      <>
        <SEOHead title="Reset Password" noindex />
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-8 text-center">
            <h1 className="text-2xl font-bold">Invalid or Expired Link</h1>
            <p className="text-sm text-muted-foreground">This password reset link is invalid or has expired.</p>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/forgot-password">Request a New Link</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Reset Password" noindex />
      <div className="flex min-h-screen items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-lg border bg-card p-8"
        >
          <h1 className="text-2xl font-bold">Set New Password</h1>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Password
          </Button>
        </form>
      </div>
    </>
  );
}
