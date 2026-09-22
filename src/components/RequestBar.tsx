import { HTTP_METHODS, type HttpMethod } from '../types';

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: 'text-emerald-600 dark:text-emerald-400',
  POST: 'text-amber-600 dark:text-amber-400',
  PUT: 'text-blue-600 dark:text-blue-400',
  PATCH: 'text-purple-600 dark:text-purple-400',
  DELETE: 'text-red-600 dark:text-red-400',
  HEAD: 'text-slate-600 dark:text-slate-400',
  OPTIONS: 'text-slate-600 dark:text-slate-400',
};

interface RequestBarProps {
  method: HttpMethod;
  baseUrl: string;
  path: string;
  loading: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onBaseUrlChange: (value: string) => void;
  onPathChange: (value: string) => void;
  onSend: () => void;
  onSave: () => void;
  onDownload: () => void;
}

export function RequestBar({
  method,
  baseUrl,
  path,
  loading,
  onMethodChange,
  onBaseUrlChange,
  onPathChange,
  onSend,
  onSave,
  onDownload,
}: RequestBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <select
        value={method}
        onChange={(e) => onMethodChange(e.target.value as HttpMethod)}
        className={`rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-semibold ${METHOD_COLORS[method]} dark:border-slate-700 dark:bg-slate-800`}
      >
        {HTTP_METHODS.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={baseUrl}
        onChange={(e) => onBaseUrlChange(e.target.value)}
        placeholder="https://api.example.com"
        className="min-w-[200px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      <input
        type="text"
        value={path}
        onChange={(e) => onPathChange(e.target.value)}
        placeholder="/v1/users/:id"
        className="min-w-[150px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />

      <button
        type="button"
        onClick={onSave}
        className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        Save
      </button>

      <button
        type="button"
        onClick={onDownload}
        title="Download request & response details as .txt"
        aria-label="Download request and response details as a text file"
        className="rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      </button>

      <button
        type="button"
        onClick={onSend}
        disabled={loading || !baseUrl}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Sending…' : 'Send'}
      </button>
    </div>
  );
}
