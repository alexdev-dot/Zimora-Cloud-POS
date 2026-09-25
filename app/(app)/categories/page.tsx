"use client";

import * as React from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable, type ColumnDef } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CategoryFormDialog } from "@/components/categories/CategoryFormDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import type { CategoryEntity } from "@/types";

export default function CategoriesPage() {
  return (
    <React.Suspense fallback={null}>
      <CategoriesInner />
    </React.Suspense>
  );
}

function CategoriesInner() {
  const [items, setItems] = React.useState<CategoryEntity[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryEntity | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<CategoryEntity | null>(null);

  // Fetch categories on mount
  React.useEffect(() => {
    setItems([]);
    setIsLoading(false);
  }, []);

  function saveCategory(category: CategoryEntity) {
    // Local operation - update state directly
    if (items.some((x) => x.id === category.id)) {
      setItems(prev => prev.map(x => x.id === category.id ? category : x).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Category updated');
    } else {
      setItems(prev => [...prev, category].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Category created');
    }
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    // Local operation - update state directly
    setItems(prev => prev.filter(x => x.id !== pendingDelete.id).sort((a, b) => a.name.localeCompare(b.name)));
    toast.success('Category deleted');
    setPendingDelete(null);
  }

  const columns: ColumnDef<CategoryEntity>[] = [
    {
      id: "name",
      header: "Category Name",
      accessor: (r) => r.name,
      sortable: true,
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-100 shrink-0">
            <Package className="h-5 w-5 text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="font-medium">{r.name}</p>
            <p className="text-xs text-muted-foreground">{r.description || 'No description'}</p>
          </div>
        </div>
      ),
    },

    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "products_count",
      header: "Products",
      accessor: () => 0, // TODO: Calculate actual product count
      cell: () => <span className="text-sm text-muted-foreground">0</span>,
      hideBelow: "md",
    },
    {
      id: "actions",
      header: "",
      accessor: (r) => r.id,
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="More actions">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onSelect={() => {
                setEditing(r);
                setFormOpen(true);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onSelect={() => setPendingDelete(r)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="page space-y-5">
      <PageHeader
        title="Categories"
        description={`${items.filter((c) => c.status === 'active').length} active categories`}
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Add Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={items}
        rowKey={(r) => r.id}
        loading={isLoading}
        searchable="Search categories…"
        pageSize={10}
        defaultSort={{ id: "name", dir: "asc" }}
        emptyIcon={Package}
        emptyTitle="No categories found"
        emptyDescription="Create your first category to organize your products."
        emptyAction={
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus /> Add Category
          </Button>
        }
        rowActions={(r) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="More actions">
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onSelect={() => {
                  setEditing(r);
                  setFormOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onSelect={() => setPendingDelete(r)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        mobileCard={(r) => (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-slate-100 shrink-0">
                <Package className="h-5 w-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium">{r.name}</p>
                <p className="text-[11px] text-muted-foreground">{r.description || 'No description'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge status={r.status} />
              <span className="text-xs text-muted-foreground">0 products</span>
            </div>
          </div>
        )}
      />

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        category={editing}
        onSave={saveCategory}
      />

      <ConfirmationDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete Category"
        description={`Are you sure you want to delete "${pendingDelete?.name}"? This action cannot be undone. Products in this category will need to be reassigned.`}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
      />
    </div>
  );
}
