import { Box } from "@mui/material";
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type GridOptions,
  type SortChangedEvent,
  type SortModelItem,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import type { CSSProperties } from "react";

ModuleRegistry.registerModules([AllCommunityModule]);

const tableTheme = themeQuartz.withParams({
  backgroundColor: "#ffffff",
  borderColor: "#e8eaf1",
  browserColorScheme: "light",
  fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
  foregroundColor: "#454c62",
  headerBackgroundColor: "#f8f9fc",
  headerFontWeight: 700,
  headerTextColor: "#6a7186",
  rowHoverColor: "#f7f8ff",
  spacing: 8,
  wrapperBorder: false,
});

export interface BaseTableProps<TData> {
  rows: TData[];
  columns: ColDef<TData>[];
  ariaLabel: string;
  emptyMessage?: string;
  height?: number | string;
  getRowId?: GridOptions<TData>["getRowId"];
  onSortChanged?: (sort: SortModelItem | null) => void;
}

export function BaseTable<TData>({
  rows,
  columns,
  ariaLabel,
  emptyMessage = "No records found.",
  height = 460,
  getRowId,
  onSortChanged,
}: BaseTableProps<TData>) {
  const handleSortChanged = (event: SortChangedEvent<TData>) => {
    if (!onSortChanged) return;
    const activeSort = event.api.getColumnState().find((column) => column.sort);
    onSortChanged(activeSort ? { colId: activeSort.colId, sort: activeSort.sort! } : null);
  };

  const style: CSSProperties = { height };

  return (
    <Box className="base-table" role="region" aria-label={ariaLabel} style={style}>
      <AgGridReact<TData>
        theme={tableTheme}
        rowData={rows}
        columnDefs={columns}
        defaultColDef={{
          flex: 1,
          minWidth: 120,
          sortable: false,
          resizable: true,
        }}
        getRowId={getRowId}
        onSortChanged={handleSortChanged}
        animateRows={false}
        rowHeight={56}
        headerHeight={48}
        suppressCellFocus
        localeText={{ noRowsToShow: emptyMessage }}
      />
    </Box>
  );
}
