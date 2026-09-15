"use client";

import * as React from "react";
import { Check, ShieldCheck, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/misc";

import { PERMISSION_ACTIONS, PERMISSION_MODULES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Role, PermissionMatrix } from "@/types";

// TODO: Replace with data from your backend/database
// These should be fetched from your roles management API
const ROLES: Role[] = [];

// TODO: Replace with data from your backend/database
// These should be fetched from your roles management API
const ROLE_DESCRIPTIONS: Record<string, string> = {};

// TODO: Replace with data from your backend/database
// These should be fetched from your roles management API
const ROLE_PERMISSIONS: Record<string, PermissionMatrix> = {};

export default function UsersRolesSettingsPage() {
  const [selected, setSelected] = React.useState<string>("");
  const [matrix, setMatrix] = React.useState<Record<string, PermissionMatrix>>({});

  const members = (role: string) => [] as any[];

  return (
    <div className="space-y-4">
      <SettingsPanel
        title="Roles"
        description="Each role bundles default permissions. Pick a role to review what it can do."
        footer={
          <>
            <Button asChild variant="outline">
              <a href="/employees">
                <Users /> Manage people
              </a>
            </Button>
            <Button
              onClick={() => {
                // TODO: Implement reset to defaults from backend
                toast.success("Role permissions reset to defaults");
              }}
            >
              Reset to defaults
            </Button>
          </>
        }
      >
        {ROLES.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldCheck className="mb-3 size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No roles configured yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Roles should be configured in your backend/database
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {ROLES.map((role) => {
              const active = selected === role;
              return (
                <button
                  key={role}
                  onClick={() => setSelected(role)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border p-3.5 text-left outline-none transition-all focus-ring",
                    active ? "border-primary bg-accent/60 shadow-sm" : "border-border hover:border-slate-300"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-muted-foreground" />
                      <span className="font-medium">{role}</span>
                    </div>
                    <Badge variant="outline">{members(role).length} members</Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ROLE_DESCRIPTIONS[role]}</p>
                  <div className="mt-2.5 flex -space-x-1.5">
                    {members(role)
                      .slice(0, 4)
                      .map((m) => (
                        <Avatar key={m.id} name={m.name} size={6} className="ring-2 ring-white" />
                      ))}
                    {members(role).length === 0 && (
                      <span className="text-[11px] text-muted-foreground">No members yet</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </SettingsPanel>

      {selected && (
        <SettingsPanel
          title={`${selected} permissions`}
          description="Untick to restrict. Changes apply to everyone with this role."
        >
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[560px] text-[13px]">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="table-head-cell">Module</th>
                  {PERMISSION_ACTIONS.map((a) => (
                    <th key={a} className="table-head-cell text-center">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MODULES.map((m) => (
                  <tr key={m.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2 font-medium">{m.label}</td>
                    {PERMISSION_ACTIONS.map((a) => (
                      <td key={a} className="px-3 py-2 text-center">
                        <button
                          role="switch"
                          aria-checked={matrix[selected]?.[m.id]?.[a] || false}
                          aria-label={`${a} ${m.label}`}
                          onClick={() =>
                            setMatrix((prev) => ({
                              ...prev,
                              [selected]: {
                                ...prev[selected],
                                [m.id]: { ...prev[selected]?.[m.id], [a]: !prev[selected]?.[m.id]?.[a] },
                              },
                            }))
                          }
                          className={cn(
                            "focus-ring inline-flex size-5 items-center justify-center rounded border transition-colors",
                            matrix[selected]?.[m.id]?.[a]
                              ? "border-primary bg-primary text-white"
                              : "border-input bg-card hover:border-slate-400"
                          )}
                        >
                          {matrix[selected]?.[m.id]?.[a] && <Check className="size-3" strokeWidth={3} />}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Owners always retain full access for compliance reasons.
          </p>
        </SettingsPanel>
      )}

      <SettingsPanel title="Invitations" description="Pending invites join with their assigned role">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border px-4 py-3.5">
          <p className="text-[13px] text-muted-foreground">No pending invitations</p>
          <Button asChild variant="outline" size="sm">
            <a href="/employees">
              <UserPlus /> Invite employee
            </a>
          </Button>
        </div>
      </SettingsPanel>
    </div>
  );
}
