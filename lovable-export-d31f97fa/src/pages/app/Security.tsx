import { useState } from "react";
import { SEOHead } from "@/components/seo/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, Smartphone, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useUpdateProfile, use2FASetup, use2FAConfirm, use2FADisable, use2FARecoveryCodes } from "@/hooks/use-backend";
import { useAuth } from "@/contexts/AuthContext";

export default function Security() {
  const { user } = useAuth();
  const [step, setStep] = useState<"idle" | "setup" | "verify">("idle");
  const [otpCode, setOtpCode] = useState("");
  const [showBackup, setShowBackup] = useState(false);
  const [confirmedRecoveryCodes, setConfirmedRecoveryCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);

  const { data: setupData, isLoading: isLoadingSetup } = use2FASetup();
  const confirmMutation = use2FAConfirm();
  const disableMutation = use2FADisable();

  const is2FAEnabled = !!user?.is_2fa_enabled;
  const { data: recoveryCodesData } = use2FARecoveryCodes(is2FAEnabled);

  const updateProfile = useUpdateProfile();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setUpdating(true);
    try {
      await updateProfile.mutateAsync({ password: newPassword, password_confirmation: confirmPassword });
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const handleVerify = async () => {
    if (otpCode.length !== 6) {
      toast({ title: "Invalid code", description: "Enter a 6-digit code", variant: "destructive" });
      return;
    }

    try {
      const result = await confirmMutation.mutateAsync(otpCode);
      setConfirmedRecoveryCodes(result.recovery_codes);
      setStep("idle");
      setOtpCode("");
      toast({ title: "2FA Enabled", description: "Your account is now protected." });
    } catch (err: any) {
      toast({ title: "Verification failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDisable = async () => {
    if (!disablePassword) {
      setIsDisabling(true);
      return;
    }

    try {
      await disableMutation.mutateAsync({ password: disablePassword });
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been turned off." });
      setDisablePassword("");
      setIsDisabling(false);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const backupCodes = confirmedRecoveryCodes.length > 0
    ? confirmedRecoveryCodes
    : (recoveryCodesData?.recovery_codes || []);

  return (
    <>
      <SEOHead title="Security & 2FA" noindex />
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Security & 2FA</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              {is2FAEnabled ? (
                <ShieldCheck className="h-8 w-8 text-success" />
              ) : (
                <Shield className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <CardTitle className="text-lg">Two-Factor Authentication (TOTP)</CardTitle>
                <CardDescription>
                  Add an extra layer of security using an authenticator app like Google Authenticator or Authy.
                </CardDescription>
              </div>
              <Badge variant={is2FAEnabled ? "default" : "secondary"} className="ml-auto">
                {is2FAEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {is2FAEnabled && step === "idle" && (
              <div className="flex flex-col gap-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowBackup(!showBackup)}>
                    {showBackup ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
                    {showBackup ? "Hide" : "Show"} Backup Codes
                  </Button>
                  {!isDisabling && (
                    <Button variant="destructive" size="sm" onClick={() => setIsDisabling(true)}>
                      Disable 2FA
                    </Button>
                  )}
                </div>

                {isDisabling && (
                  <div className="flex items-end gap-2 max-w-sm rounded-lg border bg-muted/50 p-4">
                    <div className="flex-1 space-y-1.5">
                      <Label htmlFor="disable-pass">Confirm Password to Disable</Label>
                      <Input
                        id="disable-pass"
                        type="password"
                        placeholder="Your password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                      />
                    </div>
                    <Button variant="destructive" onClick={handleDisable} disabled={disableMutation.isPending}>
                      {disableMutation.isPending ? "Disabling..." : "Confirm"}
                    </Button>
                    <Button variant="ghost" onClick={() => setIsDisabling(false)}>Cancel</Button>
                  </div>
                )}

                {showBackup && (
                  <Card className="bg-muted">
                    <CardContent className="py-3">
                      <p className="text-xs font-medium mb-2">Save these backup codes in a safe place:</p>
                      <div className="grid grid-cols-2 gap-1">
                        {backupCodes.map((code, i) => (
                          <code key={i} className="text-xs font-mono bg-background px-2 py-1 rounded">{code}</code>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          navigator.clipboard.writeText(backupCodes.join("\n"));
                          toast({ title: "Copied" });
                        }}
                      >
                        <Copy className="mr-1 h-3 w-3" /> Copy All
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!is2FAEnabled && step === "idle" && (
              <Button onClick={() => setStep("setup")}>
                <Smartphone className="mr-2 h-4 w-4" /> Enable 2FA
              </Button>
            )}

            {step === "setup" && (
              <div className="space-y-4">
                {isLoadingSetup ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">1. Scan this QR code with your authenticator app:</p>
                      <div className="flex items-center justify-center rounded-lg border bg-white p-4" style={{ maxWidth: 240 }}>
                        {setupData?.qr_code_svg && (
                          <div
                            dangerouslySetInnerHTML={{ __html: setupData.qr_code_svg }}
                            className="w-48 h-48"
                          />
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Or enter this secret manually:</p>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-3 py-1.5 rounded text-sm font-mono">{setupData?.secret}</code>
                        <Button variant="ghost" size="icon" onClick={() => { if (setupData) { navigator.clipboard.writeText(setupData.secret); toast({ title: "Copied" }); } }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setStep("idle")}>Cancel</Button>
                  <Button onClick={() => setStep("verify")} disabled={!setupData}>Next: Verify Code</Button>
                </div>
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <p className="text-sm font-medium">2. Enter the 6-digit code from your authenticator app:</p>
                <div className="flex justify-start">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { setStep("setup"); setOtpCode(""); }}>Back</Button>
                  <Button onClick={handleVerify} disabled={otpCode.length !== 6 || confirmMutation.isPending}>
                    {confirmMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Verify & Enable
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Change Password</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2 max-w-sm">
              <Label>Confirm New Password</Label>
              <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <Button onClick={handlePasswordChange} disabled={updating}>
              {updating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Password
            </Button>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground">Browser • {navigator.userAgent.split(" ").pop()}</p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
