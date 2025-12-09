import { CsvParserImpl } from "../../infrastructure/parsers/CsvParserImpl";
import { TsvParserImpl } from "../../infrastructure/parsers/TsvParserImpl";
import type { ParseResult } from "../models/ParseResult";
import type { IParser } from "../ports/IParser";

export class ParseService {
  //拡張子とパーサーの対応表
  private readonly parsers: Record<string, IParser> = {
    csv: new CsvParserImpl(),
    tsv: new TsvParserImpl(),
  };

  /**
   * 文字列を直接パース
   */
  public parseText(text: string, ext: string): ParseResult {
    const parser = this.getParser(ext);
    return parser.parse(text);
  }

  /**
   * 使用するパーサーを取得
   * 拡張子に対応するパーサーがなければデフォルトでCSVパーサーを返す
   */
  private getParser(ext: string): IParser {
    const formattedExt = ext.toLowerCase();
    return this.parsers[formattedExt] ?? this.parsers["csv"];
  }
}
