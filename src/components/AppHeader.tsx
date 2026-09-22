import { formatBytes } from '../utils/format';
import { useStorageEstimate } from '../hooks/useStorageEstimate';

interface AppHeaderProps {
  storageVersion: number;
}

export function AppHeader({ storageVersion }: AppHeaderProps) {
  const { usage, quota, supported } = useStorageEstimate(storageVersion);
  const percent = quota > 0 ? Math.min(100, (usage / quota) * 100) : 0;

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
          A
        </div>
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          ApiTool
        </h1>
      </div>

      {supported ? (
        <div className="flex items-center gap-2" title="Browser storage used by this app">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Memory: {formatBytes(usage)} / {formatBytes(quota)}
          </span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      ) : (
        <span className="text-xs text-slate-400">Storage estimate unavailable</span>
      )}
    </header>
  );
}
