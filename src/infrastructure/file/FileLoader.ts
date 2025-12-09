/**
 * FileLoader
 * ブラウザでファイルを読み込み、文字列として返すユーティリティ。
 * - 自動でエンコーディング判定（UTF-8 / Shift-JIS / BOM対応）
 * - 単体テストしやすい構造
 */
export class FileLoader {
  /**
   * Fileオブジェクトを読み込み、テキストとして返す。
   * @param file inputから取得したFileオブジェクト
   * @returns ファイル内容（string）
   */
  public async loadText(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // BOM check
    const encoding = this.detectEncoding(bytes);

    const decoder = new TextDecoder(encoding, { fatal: false });
    const text = decoder.decode(bytes);
    return text;
  }

  /**
   * バイト列から推測されるエンコーディングを返す
   * - UTF-8 with BOM
   * - UTF-8
   * - Shift-JIS（ブラウザ依存、実際にはcp932が多い）
   */
  private detectEncoding(bytes: Uint8Array): string {
    // UTF-8 BOM
    if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return "utf-8";
    }

    // 一旦UTF-8としてデコードを試みる
    //エラーが出たらshift-jisと判断する
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      return "utf-8";
    } catch {
      return "shift-jis"; //fallback to shift-jis
    }
  }
}
