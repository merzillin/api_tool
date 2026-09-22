import { useState } from 'react';
import type { ApiResponseData } from '../types';
import { formatBytes } from '../utils/format';

interface ResponseViewerProps {
  response: ApiResponseData | null;
  error: string | null;
  loading: boolean;
}

function statusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-600 dark:text-emerald-400';
  if (status >= 300 && status < 400) return 'text-amber-600 dark:text-amber-400';
  if (status >= 400) return 'text-red-600 dark:text-red-400';
  return 'text-slate-500';
}

export function ResponseViewer({ response, error, loading }: ResponseViewerProps) {
  const [tab, setTab] = useState<'body' | 'headers'>('body');

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Sending request…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        {error}
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-slate-400">
        Send a request to see the response here.
      </div>
    );
  }

  const displayBody = response.bodyIsJson
    ? (() => {
        try {
          return JSON.stringify(JSON.parse(response.body), null, 2);
        } catch {
          return response.body;
        }
      })()
    : response.body;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span className={`font-semibold ${statusColor(response.status)}`}>
          {response.status} {response.statusText}
        </span>
        <span className="text-slate-500 dark:text-slate-400">{response.durationMs} ms</span>
        <span className="text-slate-500 dark:text-slate-400">{formatBytes(response.sizeBytes)}</span>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {(['body', 'headers'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-sm font-medium capitalize ${
              tab === t
                ? 'border-b-2 border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'body' ? (
        <pre className="max-h-[520px] overflow-auto rounded-md bg-slate-900 p-4 text-sm text-slate-100">
          <code>{displayBody || '(empty response body)'}</code>
        </pre>
      ) : (
        <div className="max-h-[520px] overflow-auto rounded-md border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <tbody>
              {Object.entries(response.headers).map(([key, value]) => (
                <tr key={key} className="border-b border-slate-100 last:border-0 dark:border-slate-800">
                  <td className="whitespace-nowrap px-3 py-1.5 font-medium text-slate-600 dark:text-slate-300">
                    {key}
                  </td>
                  <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400 break-all">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
