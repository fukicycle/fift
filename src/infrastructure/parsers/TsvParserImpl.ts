import type { ParseResult } from "../../domain/models/ParseResult";
import type { IParser } from "../../domain/ports/IParser";

export class TsvParserImpl implements IParser {
  /**
   * TSV形式の文字列データを受け取り、カラム名と行データの配列にパースします。
   * @param raw 生データ（TSV形式の文字列）
   * @returns パース結果（カラムと行の配列）
   */
  parse(raw: string): ParseResult {
    const lines = raw.trim().split("\n");
    if (lines.length === 0) return { columns: [], rows: [] };
    const headers = lines[0].split("\t").map((h) => h.trim());
    const rows = lines.slice(1).map((line) => {
      const values = line.split("\t").map((v) => v.trim());
      const obj: Record<string, any> = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx] ?? "";
      });
      return obj;
    });
    return { columns: headers, rows };
  }
}
