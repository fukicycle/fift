import type { Row } from "./Row";

export interface ParseResult {
  columns: string[]; // ヘッダー
  rows: Row[]; // データ行
}
