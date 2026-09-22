import { COMMON_CONTENT_TYPES } from '../constants/contentTypes';
import type { KeyValuePair } from '../types';
import { generateId } from '../utils/format';

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Header',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  function updatePair(id: string, patch: Partial<KeyValuePair>) {
    onChange(pairs.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function removePair(id: string) {
    onChange(pairs.filter((p) => p.id !== id));
  }

  function addPair() {
    onChange([...pairs, { id: generateId(), key: '', value: '', enabled: true }]);
  }

  return (
    <div className="space-y-2">
      {pairs.map((pair) => {
        const isContentType = pair.key.trim().toLowerCase() === 'content-type';
        const datalistId = `content-type-${pair.id}`;

        return (
          <div key={pair.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={pair.enabled}
              onChange={(e) => updatePair(pair.id, { enabled: e.target.checked })}
              className="h-4 w-4 shrink-0 accent-indigo-600"
            />
            <input
              type="text"
              value={pair.key}
              onChange={(e) => updatePair(pair.id, { key: e.target.value })}
              placeholder={keyPlaceholder}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              type="text"
              value={pair.value}
              onChange={(e) => updatePair(pair.id, { value: e.target.value })}
              placeholder={valuePlaceholder}
              list={isContentType ? datalistId : undefined}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
            {isContentType && (
              <datalist id={datalistId}>
                {COMMON_CONTENT_TYPES.map((type) => (
                  <option key={type} value={type} />
                ))}
              </datalist>
            )}
            <button
              type="button"
              onClick={() => removePair(pair.id)}
              aria-label="Remove"
              className="shrink-0 rounded-md px-2 py-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
            >
              ✕
            </button>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addPair}
        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
      >
        + Add {keyPlaceholder.toLowerCase()}
      </button>
    </div>
  );
}
