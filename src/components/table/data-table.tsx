import { useMemo, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type Row,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDownUp,
  ArrowUpAZ,
  ArrowUpZA,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Settings2,
} from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/shared/components/empty-state';

export type DataTableColumnMeta = {
  label?: string;
  className?: string;
  mobileHidden?: boolean;
};

export type DataTableColumnDef<TData> = ColumnDef<TData, unknown> & {
  meta?: DataTableColumnMeta;
};

export type DataTablePagination = {
  page: number;
  limit: number;
  totalItems: number;
};

export type ReusableDataTableProps<TData> = {
  data: TData[];
  columns: DataTableColumnDef<TData>[];
  pagination: DataTablePagination;
  searchValue?: string;
  sorting?: SortingState;
  columnVisibility?: VisibilityState;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  searchPlaceholder?: string;
  searchAutoComplete?: string;
  limitOptions?: number[];
  getRowId?: (row: TData, index: number) => string;
  renderMobileCard?: (row: Row<TData>) => ReactNode;
  onSearchChange?: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortingChange?: OnChangeFn<SortingState>;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
  showNumberColumn?: boolean;
  manualSorting?: boolean;
};

const defaultLimitOptions = [10, 20, 25, 50, 100];

function resolveUpdater<TValue>(updaterOrValue: TValue | ((old: TValue) => TValue), oldValue: TValue) {
  return typeof updaterOrValue === 'function' ? (updaterOrValue as (old: TValue) => TValue)(oldValue) : updaterOrValue;
}

function getColumnMeta<TData>(column: ColumnDef<TData, unknown>) {
  return column.meta as DataTableColumnMeta | undefined;
}

function getColumnLabel<TData>(column: ColumnDef<TData, unknown>, fallback: string) {
  const meta = getColumnMeta(column);

  if (meta?.label) return meta.label;
  if (typeof column.header === 'string') return column.header;

  return fallback;
}

function renderSortIcon(column: { getIsSorted: () => false | 'asc' | 'desc' }) {
  const sorted = column.getIsSorted();
  const Icon = sorted === 'asc' ? ArrowUpAZ : sorted === 'desc' ? ArrowUpZA : ArrowDownUp;

  return (
    <span className="ml-2 inline-grid size-5 place-items-center rounded-md text-muted-foreground transition-colors group-hover:bg-background/80 group-hover:text-foreground">
      <Icon className={cn('size-4 transition-colors', sorted && 'text-primary')} />
    </span>
  );
}

type TablePaginationProps = {
  page: number;
  pageCount: number;
  totalItems: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
};

function TablePagination({ page, pageCount, totalItems, isLoading, onPageChange }: TablePaginationProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-muted/20 p-2 md:flex-row md:items-center md:justify-between">
      <p className="px-1 text-sm text-muted-foreground">
        Menampilkan halaman <span className="font-medium text-foreground">{page}</span> dari {pageCount} ({totalItems} data)
      </p>
      <div className="flex items-center gap-2">
        <Button disabled={isLoading || page <= 1} size="icon" type="button" variant="outline" onClick={() => onPageChange(1)}>
          <ChevronsLeft className="size-4" />
        </Button>
        <Button disabled={isLoading || page <= 1} size="icon" type="button" variant="outline" onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-20 text-center text-sm">{page} / {pageCount}</span>
        <Button disabled={isLoading || page >= pageCount} size="icon" type="button" variant="outline" onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="size-4" />
        </Button>
        <Button disabled={isLoading || page >= pageCount} size="icon" type="button" variant="outline" onClick={() => onPageChange(pageCount)}>
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

type TableContentProps<TData> = {
  table: ReturnType<typeof useReactTable<TData>>;
  isLoading: boolean;
  emptyTitle: string;
  emptyDescription: string;
  renderMobileCard?: (row: Row<TData>) => ReactNode;
};

function TableContent<TData>({ table, isLoading, emptyTitle, emptyDescription, renderMobileCard }: TableContentProps<TData>) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <table className="w-full caption-bottom text-sm">
          <thead className="bg-muted/35">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn('h-10 px-4 text-left align-middle text-sm font-medium text-muted-foreground', getColumnMeta(header.column.columnDef)?.className)}
                  >
                    {header.isPlaceholder ? null : (
                      <button
                        className={cn('group inline-flex items-center rounded-md text-left transition-colors', header.column.getCanSort() && 'cursor-pointer select-none hover:text-foreground')}
                        disabled={!header.column.getCanSort() || isLoading}
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() ? renderSortIcon(header.column) : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="h-24 px-3 text-center text-sm text-muted-foreground" colSpan={table.getVisibleLeafColumns().length || 1}>
                  Memuat data...
                </td>
              </tr>
            ) : null}

            {!isLoading && table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={table.getVisibleLeafColumns().length || 1}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : null}

            {!isLoading
              ? table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/20 last:border-0">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn('px-4 py-2.5 align-middle text-foreground/90', getColumnMeta(cell.column.columnDef)?.className)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 md:hidden">
        {isLoading ? <div className="rounded-sm border p-4 text-center text-sm text-muted-foreground">Memuat data...</div> : null}

        {!isLoading && table.getRowModel().rows.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} /> : null}

        {!isLoading
          ? table.getRowModel().rows.map((row) => (
              <div key={row.id} className="rounded-2xl border bg-card p-4 shadow-sm ring-1 ring-border/40">
                {renderMobileCard ? (
                  renderMobileCard(row)
                ) : (
                  <div className="space-y-3">
                    {row.getVisibleCells().flatMap((cell) => {
                      if (getColumnMeta(cell.column.columnDef)?.mobileHidden) return [];

                      return (
                        <div key={cell.id} className="grid gap-1">
                          <span className="text-xs font-medium text-muted-foreground">{getColumnLabel(cell.column.columnDef, cell.column.id)}</span>
                          <div className="text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          : null}
      </div>
    </>
  );
}

type ColumnSettingsDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  columns: ReturnType<ReturnType<typeof useReactTable<TData>>['getAllLeafColumns']>[number][];
  visibility: VisibilityState;
  onVisibilityChange: (updater: (prev: VisibilityState) => VisibilityState) => void;
  onApply: () => void;
};

function ColumnSettingsDialog<TData>({ open, onOpenChange, columns, visibility, onVisibilityChange, onApply }: ColumnSettingsDialogProps<TData>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogCloseButton onClick={() => onOpenChange(false)} />
        <AlertDialogHeader>
          <AlertDialogTitle>Setting Kolom Table</AlertDialogTitle>
          <AlertDialogDescription>Pilih kolom yang ingin ditampilkan pada table dan list card.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
          {columns.map((column) => {
            const isChecked = visibility[column.id] !== false;
            const canHide = column.getCanHide();

            return (
              <label key={column.id} className={cn('flex items-center gap-3 rounded-sm border p-3 text-sm', !canHide && 'opacity-60')}>
                <input
                  checked={isChecked}
                  className="size-4 rounded-sm border-input accent-primary"
                  disabled={!canHide}
                  type="checkbox"
                  onChange={(event) => onVisibilityChange((current) => ({ ...current, [column.id]: event.target.checked }))}
                />
                <span>{getColumnLabel(column.columnDef, column.id)}</span>
              </label>
            );
          })}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel type="button" onClick={() => onOpenChange(false)}>Batal</AlertDialogCancel>
          <AlertDialogAction type="button" onClick={onApply}>Simpan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ReusableDataTable<TData>({
  data,
  columns,
  pagination,
  searchValue,
  sorting,
  columnVisibility,
  isLoading = false,
  isError = false,
  errorMessage = 'Gagal memuat data.',
  emptyTitle = 'Data tidak ditemukan',
  emptyDescription = 'Coba ubah kata kunci pencarian atau filter data.',
  searchPlaceholder = 'Cari data...',
  searchAutoComplete = 'off',
  limitOptions = defaultLimitOptions,
  getRowId,
  renderMobileCard,
  onSearchChange,
  onPageChange,
  onLimitChange,
  onSortingChange,
  onColumnVisibilityChange,
  showNumberColumn = false,
  manualSorting = false,
}: ReusableDataTableProps<TData>) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue ?? '');
  const [localSorting, setLocalSorting] = useState<SortingState>(sorting ?? []);
  const [localColumnVisibility, setLocalColumnVisibility] = useState<VisibilityState>(columnVisibility ?? {});
  const [columnSettings, setColumnSettings] = useState<{ open: boolean; draft: VisibilityState }>({ open: false, draft: {} });

  const activeSearchValue = searchValue ?? localSearchValue;
  const activeSorting = sorting ?? localSorting;
  const activeColumnVisibility = columnVisibility ?? localColumnVisibility;
  const pageCount = Math.max(1, Math.ceil(pagination.totalItems / pagination.limit));
  const safePage = Math.min(Math.max(pagination.page, 1), pageCount);

  const tableColumns = useMemo<ColumnDef<TData, unknown>[]>(() => {
    if (!showNumberColumn) return columns;

    const numberColumn: DataTableColumnDef<TData> = {
      id: 'rowNumber',
      header: 'No',
      enableSorting: false,
      enableHiding: true,
      meta: {
        label: 'No',
        className: 'w-16 text-center',
      },
      cell: ({ row }) => (safePage - 1) * pagination.limit + row.index + 1,
    };

    return [numberColumn, ...columns];
  }, [columns, pagination.limit, safePage, showNumberColumn]);

  const paginationState = useMemo<PaginationState>(() => ({ pageIndex: safePage - 1, pageSize: pagination.limit }), [pagination.limit, safePage]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    pageCount,
    state: {
      pagination: paginationState,
      sorting: activeSorting,
      columnVisibility: activeColumnVisibility,
      columnFilters: [] as ColumnFiltersState,
    },
    manualPagination: true,
    manualSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    getRowId,
    onSortingChange: (updater) => {
      const nextSorting = resolveUpdater(updater, activeSorting);

      if (sorting === undefined) setLocalSorting(nextSorting);
      onSortingChange?.(nextSorting);
    },
    onColumnVisibilityChange: (updater) => {
      const nextVisibility = resolveUpdater(updater, activeColumnVisibility);

      if (columnVisibility === undefined) setLocalColumnVisibility(nextVisibility);
      onColumnVisibilityChange?.(nextVisibility);
    },
  });

  function handleSearchChange(value: string) {
    if (searchValue === undefined) setLocalSearchValue(value);
    onSearchChange?.(value);
  }

  function openColumnSetting() {
    setColumnSettings({ open: true, draft: activeColumnVisibility });
  }

  function applyColumnSetting() {
    if (columnVisibility === undefined) setLocalColumnVisibility(columnSettings.draft);

    onColumnVisibilityChange?.(columnSettings.draft);
    setColumnSettings((prev) => ({ ...prev, open: false }));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Cari data"
            autoComplete={searchAutoComplete}
            className="h-9 rounded-lg bg-background pl-9 shadow-xs transition-all focus-visible:ring-primary/20"
            disabled={isLoading}
            name="data-table-search"
            placeholder={searchPlaceholder}
            value={activeSearchValue}
            onChange={(event) => handleSearchChange(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-muted-foreground" htmlFor="table-limit">Limit</label>
          <select
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm shadow-xs outline-none transition-all focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
            id="table-limit"
            value={pagination.limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {limitOptions.map((limit) => (
              <option key={limit} value={limit}>{limit}</option>
            ))}
          </select>

          <Button className="h-9 rounded-lg shadow-xs" disabled={isLoading} type="button" variant="outline" onClick={openColumnSetting}>
            <Settings2 className="size-4" />
            Setting Table
          </Button>
        </div>
      </div>

      {isError ? <EmptyState title="Terjadi kesalahan" description={errorMessage} /> : null}

      {!isError ? (
        <TableContent table={table} isLoading={isLoading} emptyTitle={emptyTitle} emptyDescription={emptyDescription} renderMobileCard={renderMobileCard} />
      ) : null}

      <TablePagination page={safePage} pageCount={pageCount} totalItems={pagination.totalItems} isLoading={isLoading} onPageChange={onPageChange} />

      <ColumnSettingsDialog
        open={columnSettings.open}
        onOpenChange={(open) => setColumnSettings((prev) => ({ ...prev, open }))}
        columns={table.getAllLeafColumns()}
        visibility={columnSettings.draft}
        onVisibilityChange={(updater) => setColumnSettings((prev) => ({ ...prev, draft: updater(prev.draft) }))}
        onApply={applyColumnSetting}
      />
    </div>
  );
}

export { ReusableDataTable as DataTable };
