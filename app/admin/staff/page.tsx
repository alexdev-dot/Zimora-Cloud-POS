"use client";

import * as React from "react";
import { useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Badge,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Ticket,
  User,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, NativeSelect, FormField } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge as StatusBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "critical";
type TicketCategory = "technical" | "billing" | "feature" | "bug" | "other";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  requester: string;
  requesterEmail: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  responses: Array<{
    id: string;
    author: string;
    authorRole: "staff" | "requester";
    message: string;
    createdAt: string;
  }>;
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; icon: any }> = {
  open: { label: "Open", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Ticket },
  in_progress: { label: "In Progress", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  resolved: { label: "Resolved", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  closed: { label: "Closed", color: "bg-slate-50 text-slate-700 border-slate-200", icon: XCircle },
};

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; color: string; level: number }> = {
  low: { label: "Low", color: "bg-slate-100 text-slate-600", level: 1 },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700", level: 2 },
  high: { label: "High", color: "bg-orange-100 text-orange-700", level: 3 },
  critical: { label: "Critical", color: "bg-red-100 text-red-700", level: 4 },
};

const CATEGORY_CONFIG: Record<TicketCategory, { label: string; icon: any }> = {
  technical: { label: "Technical", icon: AlertCircle },
  billing: { label: "Billing", icon: Badge },
  feature: { label: "Feature Request", icon: Plus },
  bug: { label: "Bug Report", icon: XCircle },
  other: { label: "Other", icon: MessageSquare },
};

// Mock data
const MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TKT-001",
    subject: "Unable to process M-Pesa payments",
    description: "Customers are reporting errors when trying to pay via M-Pesa. The payment gateway seems to be timing out.",
    status: "open",
    priority: "high",
    category: "technical",
    requester: "John Kamau",
    requesterEmail: "john.kamau@company.com",
    assignedTo: "Sarah Admin",
    createdAt: "2024-01-15T09:30:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    responses: [],
  },
  {
    id: "TKT-002",
    subject: "Invoice not generating correctly",
    description: "The invoice template is not showing the company logo and tax calculations are incorrect.",
    status: "in_progress",
    priority: "medium",
    category: "bug",
    requester: "Mary Wanjiku",
    requesterEmail: "mary.wanjiku@company.com",
    assignedTo: "Tech Support",
    createdAt: "2024-01-14T14:20:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    responses: [
      {
        id: "RESP-001",
        author: "Tech Support",
        authorRole: "staff",
        message: "We're investigating the invoice template issue. Can you provide a screenshot of the error?",
        createdAt: "2024-01-15T10:00:00Z",
      },
    ],
  },
  {
    id: "TKT-003",
    subject: "Request for barcode scanner integration",
    description: "We would like to integrate our existing barcode scanners with the POS system. Is this supported?",
    status: "open",
    priority: "low",
    category: "feature",
    requester: "Peter Ochieng",
    requesterEmail: "peter.ochieng@company.com",
    createdAt: "2024-01-13T11:45:00Z",
    updatedAt: "2024-01-13T11:45:00Z",
    responses: [],
  },
  {
    id: "TKT-004",
    subject: "Billing discrepancy - December charges",
    description: "Our December invoice shows charges for 5 locations but we only have 3 active locations.",
    status: "resolved",
    priority: "high",
    category: "billing",
    requester: "Grace Njeri",
    requesterEmail: "grace.njeri@company.com",
    assignedTo: "Billing Team",
    createdAt: "2024-01-10T16:00:00Z",
    updatedAt: "2024-01-12T09:30:00Z",
    responses: [
      {
        id: "RESP-002",
        author: "Billing Team",
        authorRole: "staff",
        message: "We've reviewed your account and found the error. A credit has been applied to your account.",
        createdAt: "2024-01-12T09:30:00Z",
      },
    ],
  },
  {
    id: "TKT-005",
    subject: "System completely down - urgent",
    description: "Our entire POS system is inaccessible. All stores are affected. This is critical for our business operations.",
    status: "in_progress",
    priority: "critical",
    category: "technical",
    requester: "David Mutua",
    requesterEmail: "david.mutua@company.com",
    assignedTo: "Emergency Response",
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-15T08:30:00Z",
    responses: [
      {
        id: "RESP-003",
        author: "Emergency Response",
        authorRole: "staff",
        message: "Our team is actively working on this issue. We expect resolution within 30 minutes.",
        createdAt: "2024-01-15T08:30:00Z",
      },
    ],
  },
];

export default function SupportStaffPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(MOCK_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newResponse, setNewResponse] = useState("");

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  // Sort tickets by priority and date
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    const priorityDiff = PRIORITY_CONFIG[b.priority].level - PRIORITY_CONFIG[a.priority].level;
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Get ticket counts
  const ticketCounts = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    critical: tickets.filter((t) => t.priority === "critical").length,
  };

  const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
    toast.success("Ticket status updated");
  };

  const handleAssignTicket = (ticketId: string, assignee: string) => {
    setTickets(
      tickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, assignedTo: assignee, updatedAt: new Date().toISOString() }
          : ticket
      )
    );
    toast.success("Ticket assigned successfully");
  };

  const handleAddResponse = () => {
    if (!selectedTicket || !newResponse.trim()) return;

    const response = {
      id: `RESP-${Date.now()}`,
      author: "Current Admin",
      authorRole: "staff" as const,
      message: newResponse,
      createdAt: new Date().toISOString(),
    };

    setTickets(
      tickets.map((ticket) =>
        ticket.id === selectedTicket.id
          ? {
              ...ticket,
              responses: [...ticket.responses, response],
              status: ticket.status === "open" ? "in_progress" : ticket.status,
              updatedAt: new Date().toISOString(),
            }
          : ticket
      )
    );

    setSelectedTicket({
      ...selectedTicket,
      responses: [...selectedTicket.responses, response],
      status: selectedTicket.status === "open" ? "in_progress" : selectedTicket.status,
      updatedAt: new Date().toISOString(),
    });

    setNewResponse("");
    toast.success("Response added successfully");
  };

  const handleCreateTicket = (ticketData: Partial<SupportTicket>) => {
    const newTicket: SupportTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, "0")}`,
      subject: ticketData.subject || "",
      description: ticketData.description || "",
      status: "open",
      priority: ticketData.priority || "medium",
      category: ticketData.category || "other",
      requester: ticketData.requester || "",
      requesterEmail: ticketData.requesterEmail || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: [],
    };

    setTickets([newTicket, ...tickets]);
    setIsCreateModalOpen(false);
    toast.success("Ticket created successfully");
  };

  return (
    <div className="page space-y-6">
      <PageHeader
        title="Support and Ticketing"
        description="Manage customer support tickets and requests"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4 mr-2" /> New Ticket
          </Button>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Total Tickets" value={ticketCounts.total} icon={Ticket} color="primary" />
        <StatCard label="Open" value={ticketCounts.open} icon={Ticket} color="blue" />
        <StatCard label="In Progress" value={ticketCounts.inProgress} icon={Clock} color="amber" />
        <StatCard label="Resolved" value={ticketCounts.resolved} icon={CheckCircle2} color="emerald" />
        <StatCard label="Closed" value={ticketCounts.closed} icon={XCircle} color="slate" />
        <StatCard label="Critical" value={ticketCounts.critical} icon={AlertCircle} color="red" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <NativeSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | "all")}
              className="w-[140px]"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | "all")}
              className="w-[140px]"
            >
              <option value="all">All Priority</option>
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | "all")}
              className="w-[140px]"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </NativeSelect>
          </div>
          <Button variant="outline" size="sm">
            <Filter className="size-4 mr-2" /> More Filters
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ticket List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tickets ({sortedTickets.length})</h3>
            <Button variant="ghost" size="sm">
              <ArrowUpDown className="size-4 mr-2" /> Sort
            </Button>
          </div>

          {sortedTickets.length === 0 ? (
            <Card className="p-8 text-center">
              <Ticket className="mx-auto size-12 text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">No tickets found matching your filters</p>
            </Card>
          ) : (
            sortedTickets.map((ticket) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                isSelected={selectedTicket?.id === ticket.id}
                onClick={() => setSelectedTicket(ticket)}
              />
            ))
          )}
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-1">
          {selectedTicket ? (
            <TicketDetailPanel
              ticket={selectedTicket}
              onClose={() => setSelectedTicket(null)}
              onStatusChange={handleStatusChange}
              onAssign={handleAssignTicket}
              onResponseAdd={handleAddResponse}
              newResponse={newResponse}
              setNewResponse={setNewResponse}
            />
          ) : (
            <Card className="p-8 text-center">
              <MessageSquare className="mx-auto size-12 text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">Select a ticket to view details</p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isCreateModalOpen && (
        <CreateTicketModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateTicket}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-50 text-slate-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function TicketCard({
  ticket,
  isSelected,
  onClick,
}: {
  ticket: SupportTicket;
  isSelected: boolean;
  onClick: () => void;
}) {
  const statusConfig = STATUS_CONFIG[ticket.status];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const categoryConfig = CATEGORY_CONFIG[ticket.category];
  const CategoryIcon = categoryConfig.icon;

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected && "border-primary ring-1 ring-primary"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
            <StatusBadge
              className={cn("text-[10px] px-2 py-0.5", statusConfig.color)}
            >
              {statusConfig.label}
            </StatusBadge>
            <StatusBadge
              className={cn("text-[10px] px-2 py-0.5", priorityConfig.color)}
            >
              {priorityConfig.label}
            </StatusBadge>
          </div>
          <h4 className="font-medium truncate">{ticket.subject}</h4>
          <p className="text-sm text-muted-foreground truncate mt-1">{ticket.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="size-3" />
              {ticket.requester}
            </div>
            <div className="flex items-center gap-1">
              <CategoryIcon className="size-3" />
              {categoryConfig.label}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="size-3" />
              {new Date(ticket.createdAt).toLocaleDateString('en-US')}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="shrink-0">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Ticket</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Close Ticket</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

function TicketDetailPanel({
  ticket,
  onClose,
  onStatusChange,
  onAssign,
  onResponseAdd,
  newResponse,
  setNewResponse,
}: {
  ticket: SupportTicket;
  onClose: () => void;
  onStatusChange: (id: string, status: TicketStatus) => void;
  onAssign: (id: string, assignee: string) => void;
  onResponseAdd: () => void;
  newResponse: string;
  setNewResponse: (value: string) => void;
}) {
  const statusConfig = STATUS_CONFIG[ticket.status];
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const categoryConfig = CATEGORY_CONFIG[ticket.category];
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="p-5">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
              <StatusBadge className={cn("text-[10px] px-2 py-0.5", statusConfig.color)}>
                <StatusIcon className="size-3 mr-1" />
                {statusConfig.label}
              </StatusBadge>
              <StatusBadge className={cn("text-[10px] px-2 py-0.5", priorityConfig.color)}>
                {priorityConfig.label}
              </StatusBadge>
            </div>
            <h3 className="font-semibold text-lg">{ticket.subject}</h3>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <XCircle className="size-4" />
          </Button>
        </div>

        {/* Ticket Info */}
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Category</span>
            <span className="font-medium">{categoryConfig.label}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Requester</span>
            <span className="font-medium">{ticket.requester}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium text-xs">{ticket.requesterEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Assigned To</span>
            <span className="font-medium">{ticket.assignedTo || "Unassigned"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="font-medium">{new Date(ticket.createdAt).toLocaleString('en-US')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <NativeSelect
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value as TicketStatus)}
            className="flex-1"
          >
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect
            value={ticket.assignedTo || ""}
            onChange={(e) => onAssign(ticket.id, e.target.value)}
            className="flex-1"
          >
            <option value="">Unassigned</option>
            <option value="Tech Support">Tech Support</option>
            <option value="Billing Team">Billing Team</option>
            <option value="Emergency Response">Emergency Response</option>
          </NativeSelect>
        </div>

        {/* Description */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Description</h4>
          <p className="text-sm text-muted-foreground">{ticket.description}</p>
        </div>

        {/* Responses */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Responses ({ticket.responses.length})</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {ticket.responses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No responses yet</p>
            ) : (
              ticket.responses.map((response) => (
                <div
                  key={response.id}
                  className={cn(
                    "p-3 rounded-lg",
                    response.authorRole === "staff"
                      ? "bg-primary/5 border border-primary/10"
                      : "bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{response.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(response.createdAt).toLocaleString('en-US')}
                    </span>
                  </div>
                  <p className="text-sm">{response.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Response */}
        <div className="border-t pt-4">
          <FormField label="Add Response" htmlFor="response">
            <div className="flex gap-2">
              <Input
                id="response"
                placeholder="Type your response..."
                value={newResponse}
                onChange={(e) => setNewResponse(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onResponseAdd();
                  }
                }}
              />
              <Button onClick={onResponseAdd} disabled={!newResponse.trim()}>
                <Send className="size-4" />
              </Button>
            </div>
          </FormField>
        </div>
      </div>
    </Card>
  );
}

function CreateTicketModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Partial<SupportTicket>) => void;
}) {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "medium" as TicketPriority,
    category: "other" as TicketCategory,
    requester: "",
    requesterEmail: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Create New Ticket</h2>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <XCircle className="size-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Subject" required htmlFor="subject">
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Brief description of the issue"
              />
            </FormField>

            <FormField label="Description" required htmlFor="description">
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detailed description of the issue"
                className="w-full rounded-lg border border-input bg-card text-sm text-foreground shadow-[0_1px_2px_rgba(16,24,40,0.04)] placeholder:text-muted-foreground/70 focus-ring disabled:cursor-not-allowed disabled:opacity-60 min-h-[88px] px-3 py-2 sm:min-h-[72px]"
                rows={4}
              />
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Priority" htmlFor="priority">
                <NativeSelect
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                >
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>

              <FormField label="Category" htmlFor="category">
                <NativeSelect
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </NativeSelect>
              </FormField>
            </div>

            <FormField label="Requester Name" required htmlFor="requester">
              <Input
                id="requester"
                value={formData.requester}
                onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                placeholder="Customer name"
              />
            </FormField>

            <FormField label="Requester Email" required htmlFor="requesterEmail">
              <Input
                id="requesterEmail"
                type="email"
                value={formData.requesterEmail}
                onChange={(e) => setFormData({ ...formData, requesterEmail: e.target.value })}
                placeholder="customer@example.com"
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create Ticket</Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}