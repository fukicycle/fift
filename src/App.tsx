// カラム構成比較テーブル（自動ハイライト）
function ColumnCompareTable({
  left,
  right,
}: {
  left: string[];
  right: string[];
}) {
  const maxLen = Math.max(left.length, right.length);
  return (
    <table className="w-full text-xs table-auto border rounded-xl bg-gray-50">
      <thead>
        <tr>
          <th className="px-3 py-2 bg-indigo-100 text-indigo-700 font-bold border-b">
            比較元
          </th>
          <th className="px-3 py-2 bg-indigo-100 text-indigo-700 font-bold border-b">
            比較対象
          </th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: maxLen }).map((_, i) => {
          const l = left[i] ?? "";
          const r = right[i] ?? "";
          const match = l === r && l !== "";
          return (
            <tr key={i}>
              <td
                className={`px-3 py-2 font-mono border-b ${
                  match
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {l}
              </td>
              <td
                className={`px-3 py-2 font-mono border-b ${
                  match
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {r}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
import { useEffect, useState } from "react";
import { useCompare } from "./app/fooks/useCompare";
import { ProgressBar } from "./app/components/ProgressBar";
import DiffViewer from "./app/components/DiffViewer";

// モダンなプレビュー用テーブルコンポーネント
const PreviewTable = ({
  rows,
  compact = false,
}: {
  rows: string[][];
  compact?: boolean;
}) => (
  <div
    className={`overflow-auto ${
      compact ? "max-h-32" : "max-h-96"
    } w-full border rounded-xl shadow-sm bg-gray-50`}
  >
    <table className={`w-full ${compact ? "text-xs" : "text-sm"} table-auto`}>
      <thead>
        {rows.length > 0 && (
          <tr>
            {rows[0].map((_, j) => (
              <th
                key={j}
                className={`px-3 py-2 bg-indigo-100 text-indigo-700 font-bold border-b border-gray-200 ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                Col{j + 1}
              </th>
            ))}
          </tr>
        )}
      </thead>
      <tbody>
        {rows.map((cols, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-100"}>
            {cols.map((col, j) => (
              <td
                key={j}
                className={`border-b px-3 py-2 font-mono whitespace-nowrap ${
                  compact ? "text-xs" : "text-sm"
                } text-gray-700`}
              >
                {col}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const App = () => {
  // 手順バー用ラベル
  const stepLabels = [
    "比較元ファイル選択",
    "比較対象ファイル選択",
    "カラム構成確認",
    "Keyカラム選択",
    "比較カラム選択",
    "比較実行",
    "結果表示",
  ];

  const {
    leftFile,
    rightFile,
    setLeftFile,
    setRightFile,
    runCompare,
    result,
    loading,
    error,
    progress,
  } = useCompare();

  const [step, setStep] = useState(1);
  const [leftPreview, setLeftPreview] = useState<string[][] | null>(null);
  const [rightPreview, setRightPreview] = useState<string[][] | null>(null);
  const [leftAll, setLeftAll] = useState<string[][] | null>(null);
  const [rightAll, setRightAll] = useState<string[][] | null>(null);
  const [columnError, setColumnError] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [selectedCompare, setSelectedCompare] = useState<string[]>([]);

  // ファイル選択時のプレビュー取得（先頭100行）
  const handleLeftFile = (file: File | null) => {
    setLeftFile(file);
    if (file) {
      readPreview(file, setLeftPreview);
      setStep(1);
    }
  };
  const handleRightFile = (file: File | null) => {
    setRightFile(file);
    if (file) {
      readPreview(file, setRightPreview);
      setStep(2);
    }
  };

  // プレビュー用: 先頭100行を読み込む
  const readPreview = (file: File, setPreview: (rows: string[][]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).slice(0, 100);
      const rows = lines.map((line) => line.split(/,|\t/));
      setPreview(rows);
    };
    reader.readAsText(file);
  };

  // プレビューOKで全行読み込み
  const handleLeftPreviewOk = () => {
    if (leftFile) {
      readAll(leftFile, setLeftAll);
      setStep(2);
    }
  };
  const handleRightPreviewOk = () => {
    if (rightFile) {
      readAll(rightFile, setRightAll);
      setStep(3);
    }
  };

  // 全行読み込み
  const readAll = (file: File, setAll: (rows: string[][]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
      const rows = lines.map((line) => line.split(/,|\t/));
      setAll(rows);
    };
    reader.readAsText(file);
  };

  // カラム構成一致判定
  // カラム構成自動比較
  useEffect(() => {
    if (step === 3 && leftAll && rightAll) {
      const leftCols = leftAll[0] || [];
      const rightCols = rightAll[0] || [];
      let error = null;
      if (leftCols.length !== rightCols.length) {
        error = "カラム数が一致しません。";
      } else if (!leftCols.every((c, i) => c === rightCols[i])) {
        error = "カラム名が一致しません。";
      }
      setColumnError(error);
      if (!error) {
        setColumns(leftCols);
      } else {
        setColumns([]);
      }
      // ユーザ確認のため自動遷移しない
    }
  }, [step, leftAll, rightAll]);

  // 比較完了時に自動でステップ7へ遷移
  useEffect(() => {
    if (step === 6 && result) {
      setStep(7);
    }
  }, [step, result]);

  return (
    <div className="w-full bg-gray-50 flex flex-row items-start h-dvh overflow-hidden">
      <div className="flex flex-row w-full mx-auto p-8 overflow-hidden gap-4 flex-1 h-full">
        {/* 左側：縦型手順バー */}
        <div className="flex flex-col items-start gap-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 tracking-tight">
            CSV/TSV 比較ツール
          </h2>
          {stepLabels.map((label, idx) => (
            <div key={label} className="flex items-center gap-5 py-2">
              <div
                className={`rounded-full w-12 h-12 flex items-center justify-center font-extrabold text-white text-xl transition-all duration-200 ${
                  step === idx + 1
                    ? "bg-indigo-600 scale-110 shadow-lg"
                    : idx + 1 < step
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
                style={{ minWidth: "48px", minHeight: "48px" }}
              >
                {idx + 1}
              </div>
              <div
                className={`text-base font-semibold pl-2 whitespace-nowrap overflow-hidden ${
                  step === idx + 1
                    ? "text-indigo-700"
                    : idx + 1 < step
                    ? "text-green-700"
                    : "text-gray-400"
                }`}
                style={{
                  minWidth: "160px",
                  maxWidth: "220px",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
        {/* 右側：メイン画面 */}
        <div className="flex-1 bg-white shadow-xl rounded-2xl p-8 ml-2 space-y-8 border border-gray-100 h-full overflow-auto">
          {/* ステップ1: 左ファイル選択 */}
          {step === 1 && (
            <div>
              <label className="text-base font-semibold text-gray-700 mb-2 block">
                比較元ファイル
              </label>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={(e) => handleLeftFile(e.target.files?.[0] ?? null)}
                className="block w-full text-base text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {leftPreview && (
                <div className="mt-6">
                  <PreviewTable rows={leftPreview} />
                  <button
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition-colors"
                    onClick={handleLeftPreviewOk}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          )}
          {/* ステップ2: 右ファイル選択 */}
          {step === 2 && (
            <div>
              <label className="text-base font-semibold text-gray-700 mb-2 block">
                比較対象ファイル
              </label>
              <input
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={(e) => handleRightFile(e.target.files?.[0] ?? null)}
                className="block w-full text-base text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              {rightPreview && (
                <div className="mt-6">
                  <PreviewTable rows={rightPreview} />
                  <button
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition-colors"
                    onClick={handleRightPreviewOk}
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          )}
          {/* ステップ3: カラム構成一致判定 */}
          {step === 3 && (
            <div>
              <div className="mb-4 text-base font-semibold">
                2つのファイルのカラム構成を自動比較します。
              </div>
              <div className="flex flex-col gap-6 max-h-64 overflow-y-auto">
                <div className="flex-1">
                  <div className="font-bold text-xs mb-2 text-gray-600">
                    比較元カラム
                  </div>
                  <ColumnCompareTable
                    left={leftAll ? leftAll[0] : []}
                    right={rightAll ? rightAll[0] : []}
                  />
                </div>
              </div>
              {columnError && (
                <div className="mt-4 text-red-600 text-base font-semibold">
                  {columnError}
                </div>
              )}
              <button
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition-colors"
                onClick={() => setStep(4)}
                disabled={!leftAll || !rightAll}
              >
                OK
              </button>
            </div>
          )}
          {/* ステップ4: Keyカラム選択UI（カラム一致時のみ） */}
          {step === 4 && (
            <div>
              <div className="mb-4 text-base font-semibold">
                Keyカラムを選択してください（複数選択可）
              </div>
              <div className="flex gap-3 flex-wrap">
                {columns.map((col) => (
                  <label
                    key={col}
                    className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedKeys.includes(col)}
                      onChange={(e) => {
                        setSelectedKeys((prev) =>
                          e.target.checked
                            ? [...prev, col]
                            : prev.filter((k) => k !== col)
                        );
                      }}
                      className="accent-indigo-600 w-5 h-5"
                    />
                    <span className="text-sm font-mono text-gray-700">
                      {col}
                    </span>
                  </label>
                ))}
              </div>
              <button
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition-colors"
                disabled={selectedKeys.length === 0}
                onClick={() => setStep(5)}
              >
                Keyカラムを確定
              </button>
            </div>
          )}
          {/* ステップ5: 比較カラム選択UI */}
          {step === 5 && (
            <div>
              <div className="mb-4 text-base font-semibold">
                比較したいカラムを選択してください（複数選択可）
              </div>
              <button
                type="button"
                className="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg font-bold shadow hover:bg-green-600 transition-colors"
                onClick={() => setSelectedCompare(columns)}
                disabled={columns.length === 0}
              >
                一括選択
              </button>
              <div className="flex gap-3 flex-wrap">
                {columns.map((col) => (
                  <label
                    key={col}
                    className="inline-flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 shadow-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompare.includes(col)}
                      onChange={(e) => {
                        setSelectedCompare((prev) =>
                          e.target.checked
                            ? [...prev, col]
                            : prev.filter((k) => k !== col)
                        );
                      }}
                      className="accent-indigo-600 w-5 h-5"
                    />
                    <span className="text-sm font-mono text-gray-700">
                      {col}
                    </span>
                  </label>
                ))}
              </div>
              <button
                className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold shadow hover:bg-indigo-700 transition-colors"
                disabled={selectedCompare.length === 0}
                onClick={() => setStep(6)}
              >
                比較カラムを確定
              </button>
            </div>
          )}
          {/* ステップ6: 実行ボタン・進捗・結果表示 */}
          {step === 6 && (
            <div>
              {!loading ? (
                <button
                  className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow hover:bg-indigo-700 transition-colors text-lg"
                  disabled={loading}
                  onClick={() => {
                    runCompare(selectedKeys, selectedCompare);
                  }}
                >
                  比較を実行
                </button>
              ) : (
                <div className="mt-8">
                  <ProgressBar progress={progress} />
                  <div className="mt-4 text-sm text-gray-500">
                    比較処理中です...
                  </div>
                </div>
              )}
              {error && (
                <div className="text-red-600 text-base font-semibold mt-4">
                  {error}
                </div>
              )}
            </div>
          )}
          {/* ステップ7: 結果表示 */}
          {step === 7 && result && (
            <div>
              <DiffViewer result={result} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;

// 比較完了時に自動でステップ7へ遷移する副作用コンポーネント
