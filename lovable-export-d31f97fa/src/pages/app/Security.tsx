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

  // Hooks
  const { data: setupData, isLoading: isLoadingSetup, refetch: refetchSetup } = use2FASetup();
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

  const handleStartSetup = () => {
    refetchSetup();
    setStep("setup");
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
      toast({ title: "Password required", description: "Please enter your password to disable 2FA.", variant: "destructive" });
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
                <p className="text-sm text-green-600 font-medium">
                  Two-factor authentication is active on your account.
                </p>
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
                  <div className="flex flex-col gap-3 max-w-sm rounded-lg border bg-muted/50 p-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="disable-pass">Confirm Password to Disable</Label>
                      <Input
                        id="disable-pass"
                        type="password"
                        placeholder="Your password"
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" onClick={handleDisable} disabled={disableMutation.isPending} className="flex-1">
                        {disableMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirm Disable
                      </Button>
                      <Button variant="ghost" onClick={() => setIsDisabling(false)} className="flex-1">Cancel</Button>
                    </div>
                  </div>
                )}

                {showBackup && backupCodes.length > 0 && (
                  <Card className="bg-muted">
                    <CardContent className="py-3">
                      <p className="text-xs font-medium mb-2">Save these backup codes in a safe place:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, i) => (
                          <code key={i} className="text-xs font-mono bg-background px-2 py-1.5 rounded border">{code}</code>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => {
                          navigator.clipboard.writeText(backupCodes.join("\n"));
                          toast({ title: "Copied to clipboard" });
                        }}
                      >
                        <Copy className="mr-2 h-3 w-3" /> Copy All Codes
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {!is2FAEnabled && step === "idle" && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Protect your account by requiring a security code whenever you sign in.
                </p>
                <Button onClick={handleStartSetup} className="w-fit">
                  <Smartphone className="mr-2 h-4 w-4" /> Enable 2FA
                </Button>
              </div>
            )}

            {step === "setup" && (
              <div className="space-y-6">
                {isLoadingSetup ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground">Preparing your secure connection...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</div>
                        <div className="space-y-1">
                          <p className="font-semibold leading-none pt-1.5">Scan the QR Code</p>
                          <p className="text-sm text-muted-foreground">
                            Open your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator) and scan the image below.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center py-2">
                        <div className="relative group">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                          <div className="relative rounded-xl border bg-white p-6 shadow-xl">
                            {setupData?.qr_code_svg ? (
                              <div
                                dangerouslySetInnerHTML={{ __html: setupData.qr_code_svg }}
                                className="w-[180px] h-[180px] [&>svg]:w-full [&>svg]:h-full"
                              />
                            ) : (
                              <div className="w-[180px] h-[180px] flex items-center justify-center text-destructive bg-destructive/5 rounded-lg border border-dashed border-destructive/20">
                                <p className="text-xs text-center px-4">Connection interrupted.<br />Please try again.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold border">2</div>
                        <div className="space-y-3 flex-1">
                          <p className="font-semibold leading-none pt-1.5">Manual Setup Option</p>
                          <p className="text-sm text-muted-foreground">
                            If you're unable to scan the code, you can manually enter this secret key into your app:
                          </p>
                          <div className="flex items-center gap-2 group">
                            <code className="flex-1 bg-muted/50 px-4 py-3 rounded-lg text-sm font-mono border tracking-[0.2em] font-bold text-center select-all">
                              {setupData?.secret}
                            </code>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-11 w-11 shrink-0"
                              onClick={() => {
                                if (setupData) {
                                  navigator.clipboard.writeText(setupData.secret);
                                  toast({ title: "Secret key copied", description: "You can now paste it in your app." });
                                }
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-6 border-t mt-4">
                      <Button variant="ghost" onClick={() => setStep("idle")} className="flex-1">
                        Go Back
                      </Button>
                      <Button onClick={() => setStep("verify")} disabled={!setupData} className="flex-1 shadow-lg shadow-primary/20">
                        I've scanned it, continue
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === "verify" && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <p className="font-semibold">Step 2: Verify Setup</p>
                  <p className="text-sm text-muted-foreground">Enter the 6-digit code from your app to confirm.</p>
                </div>

                <div className="flex justify-center py-4">
                  <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl border-2" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl border-2" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => { setStep("setup"); setOtpCode(""); }} className="flex-1">Back</Button>
                  <Button
                    onClick={handleVerify}
                    disabled={otpCode.length !== 6 || confirmMutation.isPending}
                    className="flex-1"
                  >
                    {confirmMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Confirm & Enable
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
            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-background rounded-full border shadow-sm">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Current Session</p>
                  <p className="text-xs text-muted-foreground">{navigator.userAgent.split(" ").pop()}</p>
                </div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Live now</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
