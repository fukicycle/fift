import type { ProgressInfo } from "../../domain/services/DiffService";

type ProgressBarProps = {
  progress: ProgressInfo | null;
};

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  const percent = Math.min(100, Math.max(0, progress?.percent ?? 0));
  const message =
    progress?.message ?? (progress ? progress.phase : "待機中...");

  return (
    <>
      <div className="w-full space-y-2">
        {/*TEXT*/}
        <div className="flex justify-between text-sm text-gray-600">
          <span>{message}</span>
          <span>{percent}%</span>
        </div>

        {/*BAR*/}
        <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-300 ease-linear bg-gradient-to-r from-indigo-500 to-sky-400"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    </>
  );
};
