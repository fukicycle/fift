import type { ColumnChange, DiffResult } from "../models/DiffResult";
import type { Row } from "../models/Row";

export type ProgressInfo = {
  phase: "buildOldMap" | "scanNewMap" | "finalizing" | "done";
  processed?: number; //現在処理した行数
  total?: number; //全行数（目安）
  percent?: number; //0..100の進捗率
  message?: string; //任意のステータス文字列
};

export type ProgressCallback = (info: ProgressInfo) => void;

export class DiffService {
  private readonly keyColumns;
  private readonly compareColumns;

  constructor(keyColumns: string[], compareColumns: string[]) {
    this.keyColumns = keyColumns;
    this.compareColumns = compareColumns;
  }

  async runAsyncWithProgress(
    oldRows: Row[],
    newRows: Row[],
    onProgress?: ProgressCallback
  ): Promise<DiffResult> {
    const progress = (info: ProgressInfo) => {
      try {
        onProgress?.(info);
      } catch {
        // ignore callback errors
      }
    };

    // create a old map
    progress({
      phase: "buildOldMap",
      processed: 0,
      total: oldRows.length,
      percent: 0,
      message: "変更前ファイルのインデックスを作成中",
    });
    await this.yieldToEventLoop();
    const oldMap = this.buildMap(oldRows);

    progress({
      phase: "buildOldMap",
      processed: oldRows.length,
      total: oldRows.length,
      percent: 5,
      message: "変更前ファイルのインデックスを作成完了",
    });

    // scan new map
    progress({
      phase: "scanNewMap",
      processed: 0,
      total: newRows.length,
      percent: 5,
      message: "変更後ファイルの行をスキャン中",
    });

    const result: DiffResult = {
      added: [],
      removed: [],
      modified: [],
    };

    const total = newRows.length;
    const batch = Math.max(1, Math.floor(total / 100));
    let processed = 0;

    for (let i = 0; i < newRows.length; i++) {
      const newRow = newRows[i];
      const key = this.buildKey(newRow);
      const oldRow = oldMap.get(key);

      if (!oldRow) {
        result.added.push(newRow);
      } else {
        const changes = this.compareRow(oldRow, newRow);
        if (changes.length > 0) {
          result.modified.push({
            key,
            oldRow,
            newRow,
            changes,
          });
        }
        oldMap.delete(key);
      }
      processed++;

      if (processed % batch === 0 || i === total) {
        const percent = 5 + Math.floor((processed / Math.max(1, total)) * 85); //5..90%
        progress({
          phase: "scanNewMap",
          processed,
          total,
          percent,
          message: `変更後ファイルの行をスキャン中 (${processed}/${total})`,
        });
        await this.yieldToEventLoop();
      }
    }

    progress({
      phase: "finalizing",
      processed: 0,
      total: oldMap.size,
      percent: 95,
      message: "最終処理中",
    });

    for (const [, removedRow] of oldMap) {
      result.removed.push(removedRow);
    }

    progress({
      phase: "done",
      processed: total,
      total: total,
      percent: 100,
      message: "完了",
    });

    return result;
  }

  /**
   * 差分計算を非同期で実行します。
   * @param oldRows 以前の行データ
   * @param newRows 新しい行データ
   * @returns 差分結果
   */
  async runAsync(oldRows: Row[], newRows: Row[]): Promise<DiffResult> {
    return await Promise.resolve(this.run(oldRows, newRows));
  }

  /**
   * 差分を計算します。
   * @param oldRows 以前の行データ
   * @param newRows 新しい行データ
   * @returns 差分結果
   */
  private run(oldRows: Row[], newRows: Row[]): DiffResult {
    const oldMap = this.buildMap(oldRows);
    const newMap = this.buildMap(newRows);

    const result: DiffResult = {
      added: [],
      removed: [],
      modified: [],
    };

    for (const [key, newRow] of newMap) {
      const oldRow = oldMap.get(key);

      if (!oldRow) {
        result.added.push(newRow);
        continue;
      }

      const changes = this.compareRow(oldRow, newRow);

      if (changes.length > 0) {
        result.modified.push({
          key,
          oldRow,
          newRow,
          changes,
        });
      }

      oldMap.delete(key);
    }

    for (const [, removedRow] of oldMap) {
      result.removed.push(removedRow);
    }

    return result;
  }

  /**
   * 行データの配列からキーを生成し、マップを作成します。
   * @param rows 行データの配列
   * @returns キーと行データのマップ
   */
  private buildMap(rows: Row[]): Map<string, Row> {
    return new Map(rows.map((row) => [this.buildKey(row), row]));
  }

  /**
   * 行データからキーを生成します。
   * @param row 行データ
   * @returns 生成されたキー文字列
   */
  private buildKey(row: Row): string {
    return this.keyColumns.map((c) => row[c]).join("__");
  }

  /**
   * 2つの行データを比較し、差分となるカラムの変更内容を返します。
   * @param oldRow 以前の行データ
   * @param newRow 新しい行データ
   * @returns 変更されたカラムの配列
   */
  private compareRow(oldRow: Row, newRow: Row): ColumnChange[] {
    return this.compareColumns
      .filter((c) => oldRow[c] !== newRow[c])
      .map((c) => ({
        column: c,
        oldValue: oldRow[c],
        newValue: newRow[c],
      }));
  }

  /**
   * 少しだけイベントループに戻すための小さな遅延。
   * 大量データの場合はこれで UI 描画の機会を作る。
   */
  private yieldToEventLoop(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }
}
