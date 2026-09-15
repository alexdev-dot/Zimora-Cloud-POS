"use client";

import * as React from "react";
import { useRef } from "react";
import {
  Clock,
  KeyRound,
  MoreHorizontal,
  ShieldCheck,
  UserCog,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { MetricCard } from "@/components/shared/MetricCard";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge, RoleBadge } from "@/components/shared/StatusBadge";
import { Avatar } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { FormField, Input, NativeSelect } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { PERMISSION_ACTIONS, PERMISSION_MODULES, ROLE_PRESETS } from "@/lib/constants";
import { timeAgo, uid } from "@/lib/utils";
import { useSimulatedLoading } from "@/lib/hooks";
import { getEmployees, createEmployee, updateEmployee, updateEmployeeStatus, subscribeToEmployees, unsubscribeFromEmployees } from "@/lib/api/employees";
import type { Employee, PermissionAction, PermissionModule, Role } from "@/types";

const ROLES: Role[] = ["Owner", "Administrator", "Manager", "Cashier", "Inventory Manager"];

export default function EmployeesPage() {
  const loading = useSimulatedLoading(500);
  const [rows, setRows] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [detail, setDetail] = React.useState<Employee | null>(null);
  const [editor, setEditor] = React.useState<{ open: boolean; employee: Employee | null }>({
    open: false,
    employee: null,
  });
  const [deactivateTarget, setDeactivateTarget] = React.useState<Employee | null>(null);
  const subscriptionRef = React.useRef<any>(null);

  // Fetch employees on mount
  React.useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await getEmployees();
        setRows(data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchEmployees();

    // Set up real-time subscription (separate from data fetch to avoid duplicate subscriptions)
    if (!subscriptionRef.current) {
      const channel = subscribeToEmployees((updatedEmployees) => {
        setRows(updatedEmployees);
      });
      subscriptionRef.current = channel;
    }

    // Cleanup subscription on unmount
    return () => {
      if (subscriptionRef.current) {
        unsubscribeFromEmployees(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, []);

  const filtered = React.useMemo(
    () =>
      rows.filter((e) => {
        if (roleFilter !== "all" && e.role !== roleFilter) return false;
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        return true;
      }),
    [rows, roleFilter, statusFilter]
  );

  const stats = React.useMemo(
    () => ({
      total: rows.length,
      active: rows.filter((e) => e.status === "active").length,
      onShift: rows.filter((e) => e.status === "on_shift").length,
      inactive: rows.filter((e) => e.status === "inactive").length,
    }),
    [rows]
  );

  async function saveEmployee(emp: Employee) {
    try {
      if (rows.some((r) => r.id === emp.id)) {
        await updateEmployee(emp.id, emp);
      } else {
        await createEmployee(emp);
      }
      // Refresh list
      const updated = await getEmployees();
      setRows(updated);
    } catch (error) {
      console.error('Failed to save employee:', error);
      throw error;
    }
  }

  const columns: ColumnDef<Employee>[] = [
    {
      id: "employee",
      header: "Employee",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size={8} />
          <div className="min-w-0">
            <p className="max-w-[150px] truncate font-medium">{r.name}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{r.employeeNo}</p>
          </div>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      accessor: (r) => r.role,
      sortable: true,
      cell: (r) => <RoleBadge role={r.role} />,
    },
    {
      id: "email",
      header: "Email",
      accessor: (r) => r.email,
      hideBelow: "xl",
      cell: (r) => <span className="max-w-[180px] truncate text-muted-foreground">{r.email}</span>,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: (r) => r.phone,
      hideBelow: "lg",
      cell: (r) => <span className="tabular-nums text-muted-foreground">{r.phone}</span>,
    },
    {
      id: "branch",
      header: "Branch",
      accessor: (r) => r.branch,
      hideBelow: "xl",
      cell: (r) => <span className="text-muted-foreground">{r.branch}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} dot />,
    },
    {
      id: "last",
      header: "Last active",
      accessor: (r) => r.lastActive,
      sortable: true,
      hideBelow: "lg",
      cell: (r) => (
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Clock className="size-3" />
          {timeAgo(r.lastActive)}
        </span>
      ),
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Employees"
        description="Team members, roles and permissions"
        actions={
          <Button onClick={() => setEditor({ open: true, employee: null })}>
            <UserPlus /> Add Employee
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard loading={loading || isLoading} label="Total Employees" value={String(stats.total)} icon={Users} />
        <MetricCard loading={loading || isLoading} label="Active" value={String(stats.active + stats.onShift)} icon={ShieldCheck} iconTone="info" />
        <MetricCard loading={loading || isLoading} label="On Shift" value={String(stats.onShift)} icon={Clock} iconTone="primary" />
        <MetricCard loading={loading || isLoading} label="Inactive" value={String(stats.inactive)} icon={UserX} iconTone="destructive" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(r) => r.id}
        loading={loading || isLoading}
        searchable="Search employees…"
        pageSize={8}
        onRowClick={(r) => setDetail(r)}
        emptyIcon={UserCog}
        emptyTitle="No team members yet"
        emptyDescription="Invite your first employee to help run the shop."
        emptyAction={
          <Button onClick={() => setEditor({ open: true, employee: null })}>
            <UserPlus /> Add Employee
          </Button>
        }
        filters={
          <>
            <NativeSelect aria-label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-[150px]">
              <option value="all">All roles</option>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </NativeSelect>
            <NativeSelect aria-label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-[140px]">
              <option value="all">Any status</option>
              <option value="on_shift">On shift</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </NativeSelect>
          </>
        }
        rowActions={(r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${r.name}`}>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setDetail(r)}>
                <ShieldCheck /> View permissions
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEditor({ open: true, employee: r })}>
                <UserCog /> Edit employee
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() =>
                  toast.success("Reset link sent", { description: `A password reset link was emailed to ${r.email}.` })
                }
              >
                <KeyRound /> Reset password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                disabled={r.role === "Owner"}
                onSelect={() => setDeactivateTarget(r)}
              >
                <UserX /> {r.status === "inactive" ? "Reactivate" : "Deactivate"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Avatar name={r.name} size={9} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">{r.email}</p>
              </div>
              <RoleBadge role={r.role} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <StatusBadge status={r.status} dot />
              <span className="text-muted-foreground">{timeAgo(r.lastActive)}</span>
            </div>
          </div>
        )}
      />

      {/* Detail sheet with permission matrix */}
      <Sheet open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent>
          {detail && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-3">
                  <Avatar name={detail.name} size={12} />
                  <div className="min-w-0">
                    <SheetTitle className="truncate">{detail.name}</SheetTitle>
                    <SheetDescription>
                      {detail.employeeNo} · {detail.email}
                    </SheetDescription>
                    <div className="mt-1.5 flex gap-1.5">
                      <RoleBadge role={detail.role} />
                      <StatusBadge status={detail.status} dot />
                    </div>
                  </div>
                </div>
              </SheetHeader>
              <SheetBody>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Permissions — {detail.role}
                </h4>
                <PermissionMatrix
                  value={detail.permissions}
                  onChange={async (matrix) => {
                    const next = { ...detail, permissions: matrix };
                    try {
                      await saveEmployee(next);
                      setDetail(next);
                      toast.success("Permissions updated", { description: detail.name });
                    } catch (error) {
                      toast.error("Failed to update permissions");
                    }
                  }}
                  readOnly={false}
                />
              </SheetBody>
              <SheetFooter className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => setEditor({ open: true, employee: detail })}>
                  Edit profile
                </Button>
                <Button onClick={() => setDetail(null)}>Done</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <EmployeeEditor
        open={editor.open}
        employee={editor.employee}
        onOpenChange={(open) => setEditor({ open, employee: open ? editor.employee : null })}
        onSave={async (emp) => {
          try {
            await saveEmployee(emp);
            setEditor({ open: false, employee: null });
            toast.success(editor.employee ? "Employee updated" : "Employee added", { description: emp.name });
          } catch (error) {
            toast.error("Failed to save employee");
          }
        }}
      />

      <ConfirmationDialog
        open={Boolean(deactivateTarget)}
        onOpenChange={(o) => !o && setDeactivateTarget(null)}
        title={
          deactivateTarget?.status === "inactive"
            ? `Reactivate ${deactivateTarget?.name}?`
            : `Deactivate ${deactivateTarget?.name}?`
        }
        description={
          deactivateTarget?.status === "inactive"
            ? "They will regain access to the POS and their previous permissions."
            : "They will immediately lose access to the POS. Their sales history is preserved."
        }
        confirmLabel={deactivateTarget?.status === "inactive" ? "Reactivate" : "Deactivate"}
        destructive={deactivateTarget?.status !== "inactive"}
        onConfirm={async () => {
          if (!deactivateTarget) return;
          const status = deactivateTarget.status === "inactive" ? "active" : "inactive";
          try {
            await updateEmployeeStatus(deactivateTarget.id, status);
            // Refresh list
            const updated = await getEmployees();
            setRows(updated);
            toast.success(status === "inactive" ? "Employee deactivated" : "Employee reactivated", {
              description: deactivateTarget.name,
            });
            setDeactivateTarget(null);
          } catch (error) {
            console.error('Failed to update employee status:', error);
            toast.error("Failed to update employee status");
          }
        }}
      />
    </div>
  );
}

function PermissionMatrix({
  value,
  onChange,
  readOnly,
}: {
  value: Record<PermissionModule, Record<PermissionAction, boolean>>;
  onChange?: (m: Record<PermissionModule, Record<PermissionAction, boolean>>) => void;
  readOnly: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full min-w-[480px] text-[13px]">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="table-head-cell">Module</th>
            {PERMISSION_ACTIONS.map((a) => (
              <th key={a} className="table-head-cell text-center capitalize first-letter:normal-case">
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
                  <Checkbox
                    aria-label={`${a} ${m.label}`}
                    checked={value[m.id][a]}
                    disabled={readOnly}
                    onCheckedChange={(v) => {
                      if (!onChange) return;
                      onChange({
                        ...value,
                        [m.id]: { ...value[m.id], [a]: v === true },
                      });
                    }}
                    className="mx-auto"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmployeeEditor({
  open,
  employee,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  employee: Employee | null;
  onOpenChange: (o: boolean) => void;
  onSave: (e: Employee) => void;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<Role>("Cashier");
  const [branch, setBranch] = React.useState("Main Branch");
  const [employeeNo, setEmployeeNo] = React.useState("");
  const [status, setStatus] = React.useState<Employee["status"]>("active");
  const [permissions, setPermissions] = React.useState(ROLE_PRESETS.Cashier);
  const [pin, setPin] = React.useState("");
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; pin?: string }>({});

  React.useEffect(() => {
    if (open) {
      setName(employee?.name ?? "");
      setEmail(employee?.email ?? "");
      setPhone(employee?.phone ?? "");
      setRole(employee?.role ?? "Cashier");
      setBranch(employee?.branch ?? "Main Branch");
      setEmployeeNo(employee?.employeeNo ?? `EMP-001`);
      setStatus(employee?.status ?? "active");
      setPermissions(employee ? structuredClone(employee.permissions) : structuredClone(ROLE_PRESETS.Cashier));
      setPin(employee?.pin ?? "");
      setErrors({});
    }
  }, [open, employee]);

  function applyRolePreset(next: Role) {
    setRole(next);
    setPermissions(structuredClone(ROLE_PRESETS[next]));
  }

  function save() {
    const e: { name?: string; email?: string; pin?: string } = {};
    if (!name.trim()) e.name = "Full name is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Enter a valid email address";
    if (pin && pin.length !== 4) e.pin = "PIN must be exactly 4 digits";
    if (pin && !/^\d{4}$/.test(pin)) e.pin = "PIN must contain only numbers";
    setErrors(e);
    if (Object.keys(e).length) return;
    onSave({
      id: employee?.id ?? uid("e"),
      employeeNo,
      name: name.trim(),
      role,
      email: email.trim(),
      phone: phone.trim() || "—",
      branch,
      status,
      lastActive: employee?.lastActive ?? new Date().toISOString(),
      permissions,
      pin: pin || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit employee" : "Add employee"}</DialogTitle>
          <DialogDescription>
            {employee ? `Update ${employee.name}'s profile and access` : "Invite a team member and set their role"}
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-5">
          <div className="grid gap-3.5 sm:grid-cols-2">
            <FormField label="Full name" htmlFor="emp-name" required error={errors.name}>
              <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Njeri Kamau" aria-invalid={Boolean(errors.name)} />
            </FormField>
            <FormField label="Email" htmlFor="emp-email" required error={errors.email}>
              <Input id="emp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@zimora.co.ke" aria-invalid={Boolean(errors.email)} />
            </FormField>
            <FormField label="Phone" htmlFor="emp-phone">
              <Input id="emp-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" />
            </FormField>
            <FormField label="Role" htmlFor="emp-role" hint="Switching roles applies the role's default permissions">
              <NativeSelect id="emp-role" value={role} onChange={(e) => applyRolePreset(e.target.value as Role)}>
                {ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField label="Branch" htmlFor="emp-branch">
              <NativeSelect id="emp-branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
                <option>All branches</option>
                <option>Main Branch</option>
              </NativeSelect>
            </FormField>
            <FormField label="Employee ID" htmlFor="emp-no">
              <Input id="emp-no" value={employeeNo} onChange={(e) => setEmployeeNo(e.target.value)} className="font-mono" />
            </FormField>
            <FormField label="Status" htmlFor="emp-status">
              <NativeSelect
                id="emp-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as Employee["status"])}
              >
                <option value="active">Active</option>
                <option value="on_shift">On shift</option>
                <option value="inactive">Inactive</option>
              </NativeSelect>
            </FormField>
            <FormField label="Terminal PIN" htmlFor="emp-pin" hint="4-digit PIN for terminal access (optional)" error={errors.pin}>
              <Input 
                id="emp-pin" 
                type="password" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                maxLength={4}
                value={pin} 
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} 
                placeholder="••••" 
                className="font-mono text-center tracking-widest"
                aria-invalid={Boolean(errors.pin)} 
              />
            </FormField>
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role permissions
            </h4>
            <p className="mb-2.5 text-xs text-muted-foreground">
              Fine-tune what this role can do. Changes apply to every employee with the same custom set.
            </p>
            <div className="max-h-72 overflow-auto rounded-xl border border-border">
              <PermissionMatrix value={permissions} onChange={setPermissions} readOnly={false} />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>{employee ? "Save changes" : "Add employee"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
