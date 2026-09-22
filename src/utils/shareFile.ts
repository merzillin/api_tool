import type { SavedApiRequest } from '../types';

type ExportableRequest = Omit<SavedApiRequest, 'id' | 'createdAt' | 'updatedAt'>;

export function downloadRequestAsJson(request: SavedApiRequest) {
  const exportable: ExportableRequest = {
    name: request.name,
    method: request.method,
    baseUrl: request.baseUrl,
    path: request.path,
    headers: request.headers,
    queryParams: request.queryParams,
    body: request.body,
  };

  const blob = new Blob([JSON.stringify(exportable, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = request.name.trim().replace(/[^a-z0-9-_]+/gi, '_') || 'api-request';
  link.href = url;
  link.download = `${safeName}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function readJsonFile(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        resolve(JSON.parse(String(reader.result)));
      } catch {
        reject(new Error('File does not contain valid JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsText(file);
  });
}

export function isImportableRequest(
  value: unknown,
): value is Omit<ExportableRequest, 'queryParams'> & { queryParams?: unknown } {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.method === 'string' &&
    typeof v.baseUrl === 'string' &&
    typeof v.path === 'string' &&
    Array.isArray(v.headers) &&
    (v.queryParams === undefined || Array.isArray(v.queryParams)) &&
    typeof v.body === 'string'
  );
}
