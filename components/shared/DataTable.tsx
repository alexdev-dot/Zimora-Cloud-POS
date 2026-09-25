"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/shared/states";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessor?: (row: T) => string | number;
  cell: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
  /** Hide this column below the given breakpoint (desktop table only). */
  hideBelow?: "md" | "lg" | "xl";
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  emptyIcon?: LucideIcon;
  emptyTitle: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Extra filter controls rendered left of the search box. */
  filters?: React.ReactNode;
  searchable?: boolean | string;
  pageSize?: number;
  selectable?: boolean;
  renderBulkActions?: (selected: string[], clear: () => void) => React.ReactNode;
  /** Compact card renderer for small screens. */
  mobileCard?: (row: T) => React.ReactNode;
  /** Row-level action menu (rendered in a trailing column, desktop) . */
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;
  stickyHeader?: boolean;
  defaultSort?: { id: string; dir: "asc" | "desc" };
  footer?: React.ReactNode;
  className?: string;
  borderless?: boolean;
}

const hideMap: Record<string, string> = {
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  error,
  onRetry,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  filters,
  searchable,
  pageSize = 10,
  selectable,
  renderBulkActions,
  mobileCard,
  rowActions,
  onRowClick,
  stickyHeader,
  defaultSort,
  footer,
  className,
  borderless,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState(defaultSort ?? null);
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  React.useEffect(() => setPage(1), [query, data.length]);

  const searched = React.useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((c) =>
        String(c.accessor?.(row) ?? "")
          .toLowerCase()
          .includes(q)
      )
    );
  }, [data, query, columns]);

  const sorted = React.useMemo(() => {
    if (!sort) return searched;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.accessor) return searched;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...searched].sort((a, b) => {
      const av = col.accessor!(a);
      const bv = col.accessor!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [searched, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pageKeys = pageRows.map(rowKey);
  const allOnPageSelected = pageKeys.length > 0 && pageKeys.every((k) => selected.has(k));
  const someOnPageSelected = pageKeys.some((k) => selected.has(k));

  function toggleSort(col: ColumnDef<T>) {
    if (!col.sortable) return;
    setSort((prev) =>
      prev?.id === col.id
        ? prev.dir === "asc"
          ? { id: col.id, dir: "desc" }
          : null
        : { id: col.id, dir: "asc" }
    );
  }

  function toggleRow(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleAllOnPage() {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageKeys.forEach((k) => next.delete(k));
      else pageKeys.forEach((k) => next.add(k));
      return next;
    });
  }

  const searchActive = Boolean(searchable);
  const searchPlaceholder = typeof searchable === "string" ? searchable : "Search…";
  const hasToolbar = searchActive || filters || selected.size > 0;

  return (
    <div
      className={cn(
        !borderless && "overflow-hidden rounded-xl border border-border bg-card shadow-card",
        className
      )}
    >
      {/* Toolbar */}
      {hasToolbar && (
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:p-4 lg:flex-row lg:items-center lg:justify-between">
          {selected.size > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
              <span className="text-[13px] font-medium text-primary">
                {selected.size} selected
              </span>
              {renderBulkActions?.(
                Array.from(selected),
                () => setSelected(new Set())
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Clear selection"
                onClick={() => setSelected(new Set())}
                className="ml-auto text-muted-foreground"
              >
                <X />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">{filters}</div>
              {searchActive && selected.size === 0 && (
                <SearchInput value={query} onChange={setQuery} placeholder={searchPlaceholder} />
              )}
            </>
          )}
        </div>
      )}

      {/* Body */}
      {loading ? (
        <TableSkeleton rows={Math.min(pageSize, 7)} className="rounded-none border-0 shadow-none" />
      ) : error ? (
        <ErrorState onRetry={onRetry} />
      ) : sorted.length === 0 ? (
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className={cn("border-b bg-muted/40", stickyHeader && "sticky top-[60px] z-10")}>
                  {selectable && (
                    <th className="table-head-cell w-10 pl-4">
                      <Checkbox
                        aria-label="Select all on page"
                        checked={allOnPageSelected ? true : someOnPageSelected ? "indeterminate" : false}
                        onCheckedChange={toggleAllOnPage}
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.id}
                      scope="col"
                      aria-sort={sort?.id === col.id ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
                      className={cn(
                        "table-head-cell",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.hideBelow && hideMap[col.hideBelow],
                        col.sortable && "cursor-pointer select-none hover:text-foreground",
                        col.className
                      )}
                      onClick={() => toggleSort(col)}
                    >
                      <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                        {col.header}
                        {col.sortable &&
                          (sort?.id === col.id ? (
                            sort.dir === "asc" ? (
                              <ArrowUp className="size-3" />
                            ) : (
                              <ArrowDown className="size-3" />
                            )
                          ) : (
                            <ChevronsUpDown className="size-3 opacity-40" />
                          ))}
                      </span>
                    </th>
                  ))}
                  <th className="w-12" aria-label="Row actions" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const key = rowKey(row);
                  return (
                    <tr
                      key={key}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={cn(
                        "border-b border-border/60 transition-colors last:border-0",
                        onRowClick && "cursor-pointer hover:bg-muted/40",
                        selected.has(key) && "bg-accent/60"
                      )}
                    >
                      {selectable && (
                        <td className="table-cell pl-4" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            aria-label={`Select row ${key}`}
                            checked={selected.has(key)}
                            onCheckedChange={() => toggleRow(key)}
                          />
                        </td>
                      )}
                      {columns.map((col) => (
                        <td
                          key={col.id}
                          className={cn(
                            "table-cell",
                            col.align === "right" && "text-right",
                            col.align === "center" && "text-center",
                            col.hideBelow && hideMap[col.hideBelow],
                            col.className
                          )}
                        >
                          {col.cell(row)}
                        </td>
                      ))}
                      <td className="table-cell" onClick={(e) => e.stopPropagation()} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-border md:hidden">
            {pageRows.map((row) => {
              const key = rowKey(row);
              return (
                <div
                  key={key}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "flex items-start gap-3 p-4 active:bg-muted/40 transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/20"
                  )}
                >
                  {selectable && (
                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        aria-label={`Select row ${key}`}
                        checked={selected.has(key)}
                        onCheckedChange={() => toggleRow(key)}
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    {mobileCard ? (
                      mobileCard(row)
                    ) : (
                      <div className="space-y-1">
                        {columns
                          .filter((c) => c.accessor !== undefined)
                          .slice(0, 4)
                          .map((c) => (
                            <div key={c.id} className="flex items-baseline justify-between gap-3">
                              <span className="shrink-0 text-xs text-muted-foreground">{c.header}</span>
                              <span className="min-w-0 truncate text-right text-[13px] font-medium">
                                {c.cell(row)}
                              </span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  {rowActions && (
                    <div className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination page={safePage} pageSize={pageSize} total={sorted.length} onPageChange={setPage} />
        </>
      )}

      {footer && !loading && !error && sorted.length > 0 && (
        <div className="border-t border-border bg-muted/30 px-4 py-3 text-[13px] text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
