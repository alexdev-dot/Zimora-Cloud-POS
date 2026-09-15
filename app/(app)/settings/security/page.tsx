"use client";

import * as React from "react";
import { KeyRound, Laptop, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel, ToggleRow } from "@/components/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { FormField, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { formatDate, timeAgo } from "@/lib/utils";

export default function SecuritySettingsPage() {
  const [twoFa, setTwoFa] = React.useState(true);
  const [lockAfter, setLockAfter] = React.useState("5");
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [sessions, setSessions] = React.useState<any[]>([]);
  const [signOutAll, setSignOutAll] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function changePassword() {
    if (!current) return setError("Enter your current password");
    if (next.length < 8) return setError("New password must be at least 8 characters");
    if (next !== confirm) return setError("New passwords don't match");
    setError(null);
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Password updated", { description: "All other sessions were signed out." });
  }

  const strength = next.length >= 12 ? "Strong" : next.length >= 8 ? "Good" : next.length > 0 ? "Weak" : "";

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="Password"
        description="Use at least 8 characters with a mix of letters, numbers and symbols"
        footer={
          <Button onClick={changePassword}>
            <KeyRound /> Update password
          </Button>
        }
      >
        <div className="grid gap-3.5 sm:grid-cols-3">
          <FormField label="Current password" htmlFor="sec-current">
            <Input id="sec-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </FormField>
          <FormField label="New password" htmlFor="sec-next" hint={strength && `Strength: ${strength}`}>
            <Input id="sec-next" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </FormField>
          <FormField label="Confirm new password" htmlFor="sec-confirm">
            <Input id="sec-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </FormField>
        </div>
        {error && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {error}
          </p>
        )}
      </SettingsPanel>

      <SettingsPanel title="Two-factor authentication" description="Add an extra layer of protection to your account">
        <ToggleRow
          label="Authenticator app (TOTP)"
          description={twoFa ? "Enabled — codes required on new devices" : "Disabled — anyone with your password can sign in"}
          checked={twoFa}
          onCheckedChange={(v) => {
            setTwoFa(v);
            toast.success(v ? "Two-factor authentication enabled" : "Two-factor authentication disabled", {
              description: v ? "Scan the QR code in your authenticator app." : "We recommend keeping 2FA on for POS accounts.",
            });
          }}
        />
        <div>
          <p className="mb-1.5 text-[13px] font-medium">Auto-lock the till after inactivity</p>
          <div className="max-w-[200px]">
            <select
              aria-label="Auto-lock after"
              value={lockAfter}
              onChange={(e) => setLockAfter(e.target.value)}
              className="h-9 w-full rounded-lg border border-input bg-card px-3 text-sm shadow-sm focus-ring"
            >
              <option value="1">1 minute</option>
              <option value="5">5 minutes</option>
              <option value="15">15 minutes</option>
              <option value="never">Never</option>
            </select>
          </div>
        </div>
      </SettingsPanel>

      <SettingsPanel
        title="Active sessions"
        description="Devices currently signed in to this account"
        footer={
          <Button variant="outline" onClick={() => setSignOutAll(true)}>
            <LogOut /> Sign out all other sessions
          </Button>
        }
      >
        <ul className="space-y-2.5">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border px-4 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                {s.device.includes("iPhone") ? <Smartphone className="size-4" /> : <Laptop className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium">{s.device}</p>
                <p className="text-xs text-muted-foreground">
                  {s.location} · {s.lastActive}
                </p>
              </div>
              {s.current ? (
                <Badge variant="success" dot>
                  This device
                </Badge>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSessions((prev) => prev.filter((x) => x.id !== s.id));
                    toast.success("Session revoked", { description: s.device });
                  }}
                >
                  Revoke
                </Button>
              )}
            </li>
          ))}
        </ul>
      </SettingsPanel>

      <SettingsPanel title="Audit log" description="Recent security-relevant activity">
        <div className="flex h-[200px] items-center justify-center text-muted-foreground">
          No security activity recorded yet
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" /> Full logs are retained for 12 months · exported {formatDate(new Date().toISOString())}
        </p>
      </SettingsPanel>

      <ConfirmationDialog
        open={signOutAll}
        onOpenChange={setSignOutAll}
        title="Sign out all other sessions?"
        description="Every device except this one will be signed out and will need to sign in again."
        confirmLabel="Sign out others"
        destructive
        onConfirm={() => {
          setSessions((prev) => prev.filter((s) => s.current));
          setSignOutAll(false);
          toast.success("All other sessions signed out");
        }}
      />
    </div>
  );
}
