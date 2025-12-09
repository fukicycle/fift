type ColumnSelectorProps = {
  columns: string[];
  primaryKey: string | null;
  compareColumns: string[];
  onPrimaryKeyChange: (key: string) => void;
  onCompareColumnsChange: (cols: string[]) => void;
};

export const ColumnSelector = ({
  columns,
  primaryKey,
  compareColumns,
  onPrimaryKeyChange,
  onCompareColumnsChange,
}: ColumnSelectorProps) => {
  const toggleCompareColumn = (col: string) => {
    if (compareColumns.includes(col)) {
      onCompareColumnsChange(compareColumns.filter((c) => c !== col));
    } else {
      onCompareColumnsChange([...compareColumns, col]);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-6 border border-gray-200">
      {/* 主キー選択 */}
      <div>
        <h2 className="text-lg font-semibold mb-3">主キーを選択</h2>
        <div className="grid grid-cols-2 gap-2">
          {columns.map((col) => (
            <label
              key={col}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="primaryKey"
                value={col}
                checked={primaryKey === col}
                onChange={() => onPrimaryKeyChange(col)}
                className="h-4 w-4 text-blue-600"
              />
              <span>{col}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 比較カラム */}
      <div>
        <h2 className="text-lg font-semibold mb-3">比較対象カラムを選択</h2>
        <div className="grid grid-cols-2 gap-2">
          {columns.map((col) => (
            <label
              key={col}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                value={col}
                checked={compareColumns.includes(col)}
                onChange={() => toggleCompareColumn(col)}
                className="h-4 w-4 text-blue-600"
              />
              <span>{col}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
