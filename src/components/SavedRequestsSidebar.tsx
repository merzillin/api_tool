import { useRef, useState } from 'react';
import type { SavedApiRequest } from '../types';
import { downloadRequestAsJson, isImportableRequest, readJsonFile } from '../utils/shareFile';
import { generateId } from '../utils/format';

interface SavedRequestsSidebarProps {
  requests: SavedApiRequest[];
  activeId: string | null;
  onLoad: (request: SavedApiRequest) => void;
  onDelete: (id: string) => void;
  onImport: (request: SavedApiRequest) => void;
  onNew: () => void;
  onClearAll: () => void;
}

export function SavedRequestsSidebar({
  requests,
  activeId,
  onLoad,
  onDelete,
  onImport,
  onNew,
  onClearAll,
}: SavedRequestsSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const parsed = await readJsonFile(file);
      if (!isImportableRequest(parsed)) {
        setImportError('File is not a valid exported request');
        return;
      }
      const now = Date.now();
      onImport({
        id: generateId(),
        name: parsed.name,
        method: parsed.method,
        baseUrl: parsed.baseUrl,
        path: parsed.path,
        headers: parsed.headers,
        queryParams: Array.isArray(parsed.queryParams) ? parsed.queryParams : [],
        body: parsed.body,
        createdAt: now,
        updatedAt: now,
      });
      setImportError(null);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to import file');
    }
  }

  function handleClearAll() {
    if (window.confirm('Delete all saved requests from this browser? This cannot be undone.')) {
      onClearAll();
    }
  }

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          type="button"
          onClick={onNew}
          className="flex-1 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {importError && (
        <p className="px-3 pt-2 text-xs text-red-600 dark:text-red-400">{importError}</p>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {requests.length === 0 ? (
          <p className="p-3 text-sm text-slate-400">No saved requests yet.</p>
        ) : (
          <ul className="space-y-1">
            {requests.map((req) => (
              <li
                key={req.id}
                className={`group flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-900 ${
                  activeId === req.id ? 'bg-indigo-50 dark:bg-indigo-950' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => onLoad(req)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="mr-2 font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {req.method}
                  </span>
                  <span className="truncate text-slate-800 dark:text-slate-200">{req.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => downloadRequestAsJson(req)}
                  title="Export as JSON"
                  className="hidden shrink-0 text-slate-400 hover:text-indigo-600 group-hover:block"
                >
                  ⇩
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(req.id)}
                  title="Delete"
                  className="hidden shrink-0 text-slate-400 hover:text-red-600 group-hover:block"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {requests.length > 0 && (
        <div className="border-t border-slate-200 p-2 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClearAll}
            className="w-full rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
          >
            Clear all saved requests
          </button>
        </div>
      )}
    </aside>
  );
}
