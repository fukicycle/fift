import { useState } from "react";
import type {
  ColumnChange,
  DiffResult,
  ModifiedRow,
} from "../../domain/models/DiffResult";
import type { Row } from "../../domain/models/Row";

interface Props {
  result: DiffResult;
}

const DiffViewer = ({ result }: Props) => {
  const tabs = [
    { key: "added", label: `追加（${result.added.length}）` },
    { key: "removed", label: `削除（${result.removed.length}）` },
    { key: "modified", label: `変更（${result.modified.length}）` },
  ];

  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("added");
  return (
    <div className="p-4 space-y-4">
      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 -mb-px border-b-2 ${
              active === tab.key
                ? "border-blue-500 text-blue-600 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      {active === "added" && <AddedTable rows={result.added} />}
      {active === "removed" && <RemovedTable rows={result.removed} />}
      {active === "modified" && <ModifiedTable rows={result.modified} />}
    </div>
  );
};

export default DiffViewer;

/**
 * 追加された項目を表示するテーブルコンポーネント
 * @param param0 rows: 追加された項目の配列
 * @returns テーブル要素
 */
const AddedTable = ({ rows }: { rows: Row[] }) => {
  if (rows.length === 0) return <div>追加された項目はありません。</div>;

  return (
    <table className="w-full border">
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="bg-green-100 border-b">
            <td className="p-2 font-mono text-sm">{JSON.stringify(row)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * 変更された項目を表示するテーブルコンポーネント
 * @param param0 rows: 変更された項目の配列
 * @returns テーブル要素
 */
const RemovedTable = ({ rows }: { rows: Row[] }) => {
  if (rows.length === 0) return <div>削除された項目はありません。</div>;
  return (
    <table className="w-full border">
      <tbody>
        {rows.map((row, index) => (
          <tr key={index} className="bg-red-100 border-b">
            <td className="p-2 font-mono text-sm">{JSON.stringify(row)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

/**
 * 変更された項目を表示するテーブルコンポーネント
 * @param param0 rows: 変更された項目の配列
 * @returns テーブル要素
 */
const ModifiedTable = ({ rows }: { rows: ModifiedRow[] }) => {
  if (rows.length === 0) return <div>変更された項目はありません。</div>;
  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <details
          key={row.key}
          className="border rounded-lg overflow-hidden"
          open={false}
        >
          <summary className="cursor-pointer px-4 py-2 bg-yellow-100">
            <span className="font-mono font-bold">{row.key}</span>
            <span className="ml-2 text-gray-600">
              ({row.changes.length}件の変更)
            </span>
          </summary>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">列</th>
                <th className="p-2">変更前</th>
                <th className="p-2">変更後</th>
              </tr>
            </thead>
            <tbody>
              {row.changes.map((change: ColumnChange, index: number) => (
                <tr key={index} className="border-t">
                  <td className="p-2 font-semibold">{change.column}</td>
                  <td className="p-2 font-mono text-sm">{change.oldValue}</td>
                  <td className="p-2 font-mono text-sm">{change.newValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      ))}
    </div>
  );
};
