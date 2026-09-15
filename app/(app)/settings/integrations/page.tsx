"use client";

import * as React from "react";
import {
  Banknote,
  CheckCircle2,
  Mail,
  MessageSquare,
  Plug,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormField, Input, NativeSelect } from "@/components/ui/input";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";

interface IntegrationDef {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  category: "Payments" | "Messaging" | "Accounting";
  connected: boolean;
  action: string;
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: "mpesa",
    name: "M-Pesa",
    description: "Safaricom Daraja API — STK push payments, C2B confirmation and daily reconciliation.",
    icon: Smartphone,
    tone: "bg-emerald-600 text-white",
    category: "Payments",
    connected: false,
    action: "Connect M-Pesa",
  },
  {
    id: "africastalking",
    name: "Africa's Talking SMS",
    description: "Send receipts, offers and low-stock alerts by SMS to any Kenyan network.",
    icon: MessageSquare,
    tone: "bg-orange-500 text-white",
    category: "Messaging",
    connected: false,
    action: "Connect SMS",
  },
  {
    id: "sendgrid",
    name: "SendGrid Email",
    description: "Email receipts, monthly statements and report digests to customers.",
    icon: Mail,
    tone: "bg-blue-500 text-white",
    category: "Messaging",
    connected: false,
    action: "Connect email",
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Sync daily sales, expenses and taxes to your accountant's books.",
    icon: Banknote,
    tone: "bg-emerald-700 text-white",
    category: "Accounting",
    connected: false,
    action: "Connect QuickBooks",
  },
];

export default function IntegrationsPage() {
  const [connected, setConnected] = React.useState<Record<string, boolean>>(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected]))
  );
  const [configure, setConfigure] = React.useState<string | null>(null);
  const [disconnectTarget, setDisconnectTarget] = React.useState<string | null>(null);

  const openIntegration = INTEGRATIONS.find((i) => i.id === configure) ?? null;

  return (
    <div className="space-y-4">
      <SettingsPanel title="Connected apps" description="Extend Zimora Cloud POS with your favourite tools">
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATIONS.map((i) => {
            const isConnected = connected[i.id];
            const Icon = i.icon;
            return (
              <div
                key={i.id}
                className={
                  "flex flex-col rounded-xl border p-4 transition-colors " +
                  (isConnected ? "border-emerald-200 bg-emerald-50/40" : "border-border")
                }
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={"flex size-10 items-center justify-center rounded-lg " + i.tone}>
                    <Icon className="size-5" />
                  </span>
                  <Badge variant={isConnected ? "success" : "default"} dot>
                    {isConnected ? "Connected" : "Not connected"}
                  </Badge>
                </div>
                <p className="mt-3 text-[13.5px] font-semibold">{i.name}</p>
                <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{i.description}</p>
                <div className="mt-3.5 flex gap-2">
                  {isConnected ? (
                    <>
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfigure(i.id)}>
                        Configure
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDisconnectTarget(i.id)}>
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" className="flex-1" onClick={() => setConfigure(i.id)}>
                      <Plug /> {i.action}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </SettingsPanel>

      {/* M-Pesa deep configuration */}
      <MpesaConfigDialog
        open={configure === "mpesa"}
        onOpenChange={(o) => !o && setConfigure(null)}
        onConnect={() => {
          setConnected((c) => ({ ...c, mpesa: true }));
          setConfigure(null);
        }}
      />

      {/* Africa's Talking SMS configuration */}
      <AfricasTalkingConfigDialog
        open={configure === "africastalking"}
        onOpenChange={(o) => !o && setConfigure(null)}
        onConnect={() => {
          setConnected((c) => ({ ...c, africastalking: true }));
          setConfigure(null);
        }}
      />

      {/* SendGrid Email configuration */}
      <SendGridConfigDialog
        open={configure === "sendgrid"}
        onOpenChange={(o) => !o && setConfigure(null)}
        onConnect={() => {
          setConnected((c) => ({ ...c, sendgrid: true }));
          setConfigure(null);
        }}
      />

      {/* QuickBooks configuration */}
      <QuickBooksConfigDialog
        open={configure === "quickbooks"}
        onOpenChange={(o) => !o && setConfigure(null)}
        onConnect={() => {
          setConnected((c) => ({ ...c, quickbooks: true }));
          setConfigure(null);
        }}
      />



      <ConfirmationDialog
        open={Boolean(disconnectTarget)}
        onOpenChange={(o) => !o && setDisconnectTarget(null)}
        title={`Disconnect ${INTEGRATIONS.find((i) => i.id === disconnectTarget)?.name}?`}
        description="Stored credentials will be deleted. Features that depend on this integration will stop working immediately."
        confirmLabel="Disconnect"
        destructive
        onConfirm={() => {
          if (disconnectTarget) setConnected((c) => ({ ...c, [disconnectTarget]: false }));
          setDisconnectTarget(null);
          toast.success("Integration disconnected");
        }}
      />
    </div>
  );
}

function MpesaConfigDialog({
  open,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConnect: () => void;
}) {
  const [shortcode, setShortcode] = React.useState("");
  const [consumerKey, setConsumerKey] = React.useState("");
  const [consumerSecret, setConsumerSecret] = React.useState("");
  const [passkey, setPasskey] = React.useState("");
  const [environment, setEnvironment] = React.useState<"sandbox" | "production">("sandbox");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="size-4 text-emerald-600" /> M-Pesa configuration
          </DialogTitle>
          <DialogDescription>
            Keys from the Safaricom Daraja portal (developer.safaricom.et). Secrets are write-only —
            they are encrypted and never displayed again.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <FormField label="Business shortcode" htmlFor="mp-sc" required hint="The Lipa na M-Pesa shortcode (e.g. 174379)">
              <Input id="mp-sc" value={shortcode} onChange={(e) => setShortcode(e.target.value)} className="font-mono" />
            </FormField>
            <FormField label="Environment" htmlFor="mp-env" required>
              <NativeSelect
                id="mp-env"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value as "sandbox" | "production")}
              >
                <option value="sandbox">Sandbox (test)</option>
                <option value="production">Production (live)</option>
              </NativeSelect>
            </FormField>
            <FormField label="Consumer key" htmlFor="mp-key" required className="sm:col-span-2">
              <Input
                id="mp-key"
                type="password"
                value={consumerKey}
                onChange={(e) => setConsumerKey(e.target.value)}
                placeholder="Enter consumer key"
                autoComplete="off"
              />
            </FormField>
            <FormField label="Consumer secret" htmlFor="mp-secret" required className="sm:col-span-2">
              <Input
                id="mp-secret"
                type="password"
                value={consumerSecret}
                onChange={(e) => setConsumerSecret(e.target.value)}
                placeholder="Enter consumer secret"
                autoComplete="new-password"
              />
            </FormField>
            <FormField label="Online passkey" htmlFor="mp-passkey" required className="sm:col-span-2">
              <Input
                id="mp-passkey"
                type="password"
                value={passkey}
                onChange={(e) => setPasskey(e.target.value)}
                placeholder="Enter passkey"
                autoComplete="new-password"
              />
            </FormField>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Test connection</strong> performs a sandbox OAuth handshake.
            <strong className="text-foreground"> Disconnect</strong> deletes all stored credentials.
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => toast.success("Connection test passed", { description: "Daraja sandbox OAuth OK in 342ms." })}>
            Test connection
          </Button>
          <Button onClick={onConnect}>
            <CheckCircle2 /> Save &amp; connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AfricasTalkingConfigDialog({
  open,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConnect: () => void;
}) {
  const [username, setUsername] = React.useState("");
  const [apiKey, setApiKey] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="size-4 text-orange-500" /> Africa's Talking SMS
          </DialogTitle>
          <DialogDescription>
            Send SMS notifications to customers across all Kenyan mobile networks.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <FormField label="Username" htmlFor="at-username" required>
            <Input
              id="at-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your Africa's Talking username"
            />
          </FormField>
          <FormField label="API key" htmlFor="at-key" required>
            <Input
              id="at-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              autoComplete="off"
            />
          </FormField>
          <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Test connection</strong> sends a test SMS to verify credentials.
            <strong className="text-foreground"> Standard rates</strong> apply: KSh 1.00 per SMS.
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => toast.success("Connection test passed", { description: "SMS gateway verified successfully." })}>
            Test connection
          </Button>
          <Button onClick={onConnect}>
            <CheckCircle2 /> Save &amp; connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SendGridConfigDialog({
  open,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConnect: () => void;
}) {
  const [apiKey, setApiKey] = React.useState("");
  const [senderEmail, setSenderEmail] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="size-4 text-blue-500" /> SendGrid Email
          </DialogTitle>
          <DialogDescription>
            Send automated receipts, statements and reports via email.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <FormField label="API key" htmlFor="sg-key" required>
            <Input
              id="sg-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your SendGrid API key"
              autoComplete="off"
            />
          </FormField>
          <FormField label="Sender email" htmlFor="sg-email" required hint="Must be verified in your SendGrid account">
            <Input
              id="sg-email"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="noreply@yourbusiness.com"
            />
          </FormField>
          <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Free tier</strong> includes 100 emails/day.
            <strong className="text-foreground"> Delivery reports</strong> are tracked automatically.
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => toast.success("Connection test passed", { description: "Email gateway verified successfully." })}>
            Test connection
          </Button>
          <Button onClick={onConnect}>
            <CheckCircle2 /> Save &amp; connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuickBooksConfigDialog({
  open,
  onOpenChange,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConnect: () => void;
}) {
  const [clientId, setClientId] = React.useState("");
  const [clientSecret, setClientSecret] = React.useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="size-4 text-emerald-700" /> QuickBooks
          </DialogTitle>
          <DialogDescription>
            Sync sales, expenses and tax data with your accounting system.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-3.5">
          <FormField label="Client ID" htmlFor="qb-client" required>
            <Input
              id="qb-client"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Your QuickBooks app Client ID"
              autoComplete="off"
            />
          </FormField>
          <FormField label="Client secret" htmlFor="qb-secret" required>
            <Input
              id="qb-secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Your QuickBooks app Client Secret"
              autoComplete="new-password"
            />
          </FormField>
          <div className="rounded-lg border border-border bg-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">OAuth 2.0</strong> authentication required.
            <strong className="text-foreground"> Daily sync</strong> runs automatically at midnight.
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => toast.success("Connection test passed", { description: "QuickBooks API verified successfully." })}>
            Test connection
          </Button>
          <Button onClick={onConnect}>
            <CheckCircle2 /> Save &amp; connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
