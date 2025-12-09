export class ArrayUtil {
  /**
   * 配列を受け取り、何らかの処理を行うメソッドの説明をここに記述します。
   * @param array 対象の配列
   * @returns 処理結果
   */
  static clone<T>(array: T[]): T[] {
    return [...array];
  }

  /**
   * 配列内の各要素を指定したキーでインデックス化したオブジェクトを返します。
   * @param array 対象の配列
   * @param key インデックス化に使用するキー
   * @returns キーをプロパティとしたオブジェクト
   */
  static indexBy<T extends Record<string, any>>(
    array: T[],
    key: keyof T
  ): Record<string, T> {
    return array.reduce((acc, item) => {
      const k = String(item[key]);
      acc[k] = item;
      return acc;
    }, {} as Record<string, T>);
  }

  /**
   * 2つの配列aとbの差分を返します。
   * @param a 最初の配列
   * @param b 比較する配列
   * @returns aにのみ存在する要素の配列
   */
  static difference<T>(a: T[], b: T[]): T[] {
    const bSet = new Set(b.map((x) => JSON.stringify(x)));
    return a.filter((x) => !bSet.has(JSON.stringify(x)));
  }

  /**
   * 2つの配列aとbの差分を返します。
   * @param a 最初の配列
   * @param b 比較する配列
   * @returns aにのみ存在する要素の配列
   */
  static intersection<T>(a: T[], b: T[]): T[] {
    const bSet = new Set(b.map((x) => JSON.stringify(x)));
    return a.filter((x) => bSet.has(JSON.stringify(x)));
  }

  /**
   * 2つの配列の両方に存在する要素を返します。
   * @param a 最初の配列
   * @param b 2番目の配列
   * @returns aとbの共通部分を含む配列
   */
  static union<T>(a: T[], b: T[]): T[] {
    return [...a, ...this.difference(b, a)];
  }
}
