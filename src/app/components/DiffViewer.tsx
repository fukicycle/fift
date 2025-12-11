import { useState } from "react";
import type { DiffResult, ModifiedRow } from "../../domain/models/DiffResult";
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
    <div className="p-0 md:p-4 space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b mb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`px-5 py-2 rounded-t-lg text-base font-semibold transition-colors duration-150 focus:outline-none ${
              active === tab.key
                ? "bg-white border-x border-t border-b-0 border-indigo-400 text-indigo-700 shadow-sm"
                : "bg-gray-100 text-gray-500 hover:text-indigo-600"
            }`}
            style={{ minWidth: 100 }}
            onClick={() => setActive(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="bg-white rounded-xl shadow p-4">
        {active === "added" && <AddedTable rows={result.added} />}
        {active === "removed" && <RemovedTable rows={result.removed} />}
        {active === "modified" && <ModifiedTable rows={result.modified} />}
      </div>
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
  if (rows.length === 0)
    return (
      <div className="text-gray-500 py-4">追加された項目はありません。</div>
    );
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-y-1">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 bg-green-50 text-green-700 font-bold border-b border-green-200 text-left whitespace-nowrap"
                style={{ minWidth: 100 }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="bg-green-50 hover:bg-green-100 transition">
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 font-mono text-green-900 border-b border-green-100 whitespace-nowrap"
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * 変更された項目を表示するテーブルコンポーネント
 * @param param0 rows: 変更された項目の配列
 * @returns テーブル要素
 */

const RemovedTable = ({ rows }: { rows: Row[] }) => {
  if (rows.length === 0)
    return (
      <div className="text-gray-500 py-4">削除された項目はありません。</div>
    );
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-y-1">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="px-3 py-2 bg-red-50 text-red-700 font-bold border-b border-red-200 text-left whitespace-nowrap"
                style={{ minWidth: 100 }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="bg-red-50 hover:bg-red-100 transition">
              {columns.map((col) => (
                <td
                  key={col}
                  className="px-3 py-2 font-mono text-red-900 border-b border-red-100 whitespace-nowrap"
                >
                  {row[col]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * 変更された項目を表示するテーブルコンポーネント
 * @param param0 rows: 変更された項目の配列
 * @returns テーブル要素
 */

const ModifiedTable = ({ rows }: { rows: ModifiedRow[] }) => {
  if (rows.length === 0)
    return (
      <div className="text-gray-500 py-4">変更された項目はありません。</div>
    );

  // 列ごとにグループ化: { [column]: Array<{ key, oldValue, newValue }> }
  const columnGroups: Record<
    string,
    { key: string; oldValue: string; newValue: string }[]
  > = {};
  rows.forEach((row) => {
    row.changes.forEach((change) => {
      if (!columnGroups[change.column]) columnGroups[change.column] = [];
      columnGroups[change.column].push({
        key: row.key,
        oldValue: change.oldValue ?? "",
        newValue: change.newValue ?? "",
      });
    });
  });
  const columns = Object.keys(columnGroups);

  // 折りたたみ状態を管理
  const [open, setOpen] = useState<Record<string, boolean>>(
    Object.fromEntries(columns.map((col) => [col, false]))
  );
  const toggle = (col: string) =>
    setOpen((prev) => ({ ...prev, [col]: !prev[col] }));

  return (
    <div className="space-y-4">
      {columns.map((col) => (
        <div
          key={col}
          className="rounded-xl border border-yellow-200 bg-yellow-50 shadow-sm"
        >
          <button
            className={`w-full flex items-center px-4 py-3 border-b border-yellow-100 focus:outline-none transition bg-yellow-50 hover:bg-yellow-100 rounded-t-xl`}
            onClick={() => toggle(col)}
            aria-expanded={open[col]}
            aria-controls={`diff-col-${col}`}
            type="button"
          >
            <span className="font-bold text-yellow-800 text-base flex-1 text-left">
              {col}
            </span>
            <span className="ml-3 text-yellow-700 text-sm">
              ({columnGroups[col].length}件の変更)
            </span>
            <svg
              className={`ml-2 w-5 h-5 text-yellow-600 transform transition-transform duration-200 ${
                open[col] ? "rotate-90" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
          {open[col] && (
            <div className="overflow-x-auto" id={`diff-col-${col}`}>
              <table className="w-full min-w-max">
                <thead>
                  <tr className="bg-yellow-100 text-yellow-900 text-left">
                    <th
                      className="p-2 font-semibold whitespace-nowrap"
                      style={{ minWidth: 100 }}
                    >
                      Key
                    </th>
                    <th
                      className="p-2 font-semibold whitespace-nowrap"
                      style={{ minWidth: 100 }}
                    >
                      変更前
                    </th>
                    <th
                      className="p-2 font-semibold whitespace-nowrap"
                      style={{ minWidth: 100 }}
                    >
                      変更後
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {columnGroups[col].map((item, idx) => (
                    <tr
                      key={item.key + idx}
                      className="border-t border-yellow-100"
                    >
                      <td
                        className="p-2 font-mono text-yellow-900 whitespace-nowrap"
                        style={{ minWidth: 100 }}
                      >
                        {item.key}
                      </td>
                      <td
                        className="p-2 font-mono text-sm bg-red-50 text-red-700 rounded-l-lg whitespace-nowrap"
                        style={{ minWidth: 100 }}
                      >
                        {item.oldValue}
                      </td>
                      <td
                        className="p-2 font-mono text-sm bg-green-50 text-green-700 rounded-r-lg whitespace-nowrap"
                        style={{ minWidth: 100 }}
                      >
                        {item.newValue}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
