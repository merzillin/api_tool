import { useMemo } from 'react';

interface BodyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BodyEditor({ value, onChange }: BodyEditorProps) {
  const jsonError = useMemo(() => {
    if (!value.trim()) return null;
    try {
      JSON.parse(value);
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Invalid JSON';
    }
  }, [value]);

  function formatJson() {
    try {
      const parsed = JSON.parse(value);
      onChange(JSON.stringify(parsed, null, 2));
    } catch {
      // leave value untouched if it isn't valid JSON
    }
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Request body (JSON or raw text)
        </span>
        <button
          type="button"
          onClick={formatJson}
          disabled={!!jsonError || !value.trim()}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-indigo-400"
        >
          Format JSON
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{\n  "key": "value"\n}'
        rows={10}
        className="w-full resize-y rounded-md border border-slate-300 bg-white p-3 font-mono text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      />
      {jsonError && (
        <p className="text-xs text-red-600 dark:text-red-400">Invalid JSON: {jsonError}</p>
      )}
    </div>
  );
}
