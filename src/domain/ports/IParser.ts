import type { ParseResult } from "../models/ParseResult";

export interface IParser {
  parse(raw: string): ParseResult;
}
