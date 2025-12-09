import type { ParseResult } from "../../domain/models/ParseResult";
import type { IParser } from "../../domain/ports/IParser";

export class CsvParserImpl implements IParser {
  /**
   * 生のCSV文字列を解析して、カラムと行の配列を返します。
   * @param raw 解析対象のCSV文字列
   * @returns パース結果（カラム名と行データ）
   */
  parse(raw: string): ParseResult {
    const lines = raw.trim().split("\n");
    if (lines.length === 0) return { columns: [], rows: [] };
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const obj: Record<string, any> = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] ?? "";
      });
      return obj;
    });
    return { columns: headers, rows };
  }
}
