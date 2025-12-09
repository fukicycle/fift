import type { Row } from "./Row";

/**
 * 差分結果を表すインターフェース群
 */
export interface DiffResult {
  added: Row[];
  removed: Row[];
  modified: ModifiedRow[];
}

export interface ModifiedRow {
  key: string;
  oldRow: Row;
  newRow: Row;
  changes: ColumnChange[];
}

export interface ColumnChange {
  column: string;
  oldValue: string | null;
  newValue: string | null;
}
