import { useCompare } from "./app/fooks/useCompare";
import { ProgressBar } from "./app/components/ProgressBar";
import DiffViewer from "./app/components/DiffViewer";

const App = () => {
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">CSV/TSV 比較ツール</h2>

      {/* Card */}
      <div className="bg-white shadow rounded-xl p-6 space-y-6 border border-gray-100">
        {/* File inputs */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              左ファイル
            </label>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={(e) => setLeftFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-800"
            />
            <div className="text-xs text-gray-500">
              {leftFile?.name ?? "未選択"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              右ファイル
            </label>
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={(e) => setRightFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-gray-800"
            />
            <div className="text-xs text-gray-500">
              {rightFile?.name ?? "未選択"}
            </div>
          </div>
        </div>

        {/* Compare button */}
        <button
          onClick={() =>
            runCompare(["タグ名"], ["アイテム名", "装置", "I/Oデバイス"])
          }
          disabled={loading}
          className={`
            px-4 py-2 rounded-lg text-white font-medium
            transition-colors duration-200
            ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }
          `}
        >
          {loading ? "比較中..." : "比較開始"}
        </button>

        {/* Progress */}
        <div>
          <ProgressBar progress={progress} />
        </div>

        {/* Result / Error */}
        {error && <div className="text-red-600 text-sm">{error}</div>}

        {result && <DiffViewer result={result} />}
      </div>
    </div>
  );
};

export default App;
