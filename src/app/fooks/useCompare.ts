import { useCallback, useState } from "react";
import type { DiffResult } from "../../domain/models/DiffResult";
import { FileLoader } from "../../infrastructure/file/FileLoader";
import { ParseService } from "../../domain/services/ParseService";
import {
  DiffService,
  type ProgressInfo,
} from "../../domain/services/DiffService";

export const useCompare = () => {
  const [leftFile, setLeftFile] = useState<File | null>(null);
  const [rightFile, setRightFile] = useState<File | null>(null);
  const [result, setResult] = useState<DiffResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // progress
  const [progress, setProgress] = useState<ProgressInfo | null>(null);

  const fileLoader = new FileLoader();
  const parserService = new ParseService();

  const runCompare = useCallback(
    async (keyColumns: string[], compareColumns: string[]) => {
      if (!leftFile || !rightFile) {
        setError("両方のファイルを選択してください。");
        return;
      }

      setLoading(true);
      setError(null);
      setResult(null);
      setProgress({
        phase: "buildOldMap",
        processed: 0,
        total: 0,
        percent: 0,
        message: "開始",
      });

      try {
        // ファイルの読み込み
        const leftText = await fileLoader.loadText(leftFile);
        const rightText = await fileLoader.loadText(rightFile);

        // ファイルのパース
        const leftRows = parserService.parseText(
          leftText,
          getExtension(leftFile.name)
        ).rows;
        const rightRows = parserService.parseText(
          rightText,
          getExtension(rightFile.name)
        ).rows;

        // 差分比較
        const diffService = await new DiffService(keyColumns, compareColumns);

        const onProgress = (info: ProgressInfo) => {
          setProgress(info);
        };

        const diffResult = await diffService.runAsyncWithProgress(
          leftRows,
          rightRows,
          onProgress
        );
        setResult(diffResult);
      } catch (e: any) {
        setError(e.message || "不明なエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    },
    [leftFile, rightFile]
  );

  return {
    leftFile,
    rightFile,
    setLeftFile,
    setRightFile,
    runCompare,
    result,
    loading,
    error,
    progress,
  };
};

const getExtension = (fileName: string): string => {
  const index = fileName.lastIndexOf(".");
  return index < 0 ? "csv" : fileName.substring(index + 1).toLowerCase();
};
