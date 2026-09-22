import { useState } from 'react';
import { AppHeader } from './components/AppHeader';
import { BodyEditor } from './components/BodyEditor';
import { KeyValueEditor } from './components/KeyValueEditor';
import { RequestBar } from './components/RequestBar';
import { ResponseViewer } from './components/ResponseViewer';
import { SavedRequestsSidebar } from './components/SavedRequestsSidebar';
import { useSavedRequests } from './hooks/useSavedRequests';
import {
  METHODS_WITH_BODY,
  type ApiResponseData,
  type HttpMethod,
  type KeyValuePair,
  type SavedApiRequest,
} from './types';
import { generateId } from './utils/format';
import { buildFullPath, splitPathAndQuery } from './utils/queryParams';
import { downloadRequestReport } from './utils/requestReport';

function defaultHeaders(): KeyValuePair[] {
  return [
    { id: generateId(), key: 'Content-Type', value: 'application/json', enabled: true },
    { id: generateId(), key: 'Authorization', value: 'Bearer ', enabled: false },
  ];
}

function buildUrl(baseUrl: string, path: string): string {
  const trimmedBase = baseUrl.trim().replace(/\/+$/, '');
  const trimmedPath = path.trim();
  if (!trimmedPath) return trimmedBase;
  return `${trimmedBase}${trimmedPath.startsWith('/') ? '' : '/'}${trimmedPath}`;
}

export default function App() {
  const { requests, save, remove, clearAll, storageVersion } = useSavedRequests();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [name, setName] = useState('Untitled request');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [baseUrl, setBaseUrl] = useState('');
  const [path, setPath] = useState('');
  const [headers, setHeaders] = useState<KeyValuePair[]>(defaultHeaders());
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([]);
  const [body, setBody] = useState('');

  const [response, setResponse] = useState<ApiResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const bodySupported = METHODS_WITH_BODY.includes(method);

  function resetToNew() {
    setActiveId(null);
    setName('Untitled request');
    setMethod('GET');
    setBaseUrl('');
    setPath('');
    setHeaders(defaultHeaders());
    setQueryParams([]);
    setBody('');
    setResponse(null);
    setError(null);
  }

  function loadRequest(req: SavedApiRequest) {
    setActiveId(req.id);
    setName(req.name);
    setMethod(req.method);
    setBaseUrl(req.baseUrl);
    setPath(req.path);
    setHeaders(req.headers);
    setQueryParams(req.queryParams ?? []);
    setBody(req.body);
    setResponse(null);
    setError(null);
  }

  function handlePathChange(value: string) {
    const { base, queryParams: parsed } = splitPathAndQuery(value);
    setPath(base);
    setQueryParams(parsed);
  }

  function handleDownload() {
    downloadRequestReport({
      name,
      method,
      baseUrl,
      path,
      headers,
      queryParams,
      body,
      bodySupported,
      response,
      error,
    });
  }

  async function handleSave() {
    const now = Date.now();
    const record: SavedApiRequest = {
      id: activeId ?? generateId(),
      name: name.trim() || 'Untitled request',
      method,
      baseUrl,
      path,
      headers,
      queryParams,
      body,
      createdAt: activeId ? requests.find((r) => r.id === activeId)?.createdAt ?? now : now,
      updatedAt: now,
    };
    await save(record);
    setActiveId(record.id);
  }

  async function handleImport(req: SavedApiRequest) {
    await save(req);
    loadRequest(req);
  }

  async function handleDelete(id: string) {
    await remove(id);
    if (id === activeId) resetToNew();
  }

  async function handleClearAll() {
    await clearAll();
    resetToNew();
  }

  async function handleSend() {
    const url = buildUrl(baseUrl, buildFullPath(path, queryParams));
    if (!url) return;

    setLoading(true);
    setError(null);
    setResponse(null);

    const requestHeaders: Record<string, string> = {};
    for (const h of headers) {
      if (h.enabled && h.key.trim()) requestHeaders[h.key.trim()] = h.value;
    }

    const start = performance.now();
    try {
      const res = await fetch(url, {
        method,
        headers: requestHeaders,
        body: bodySupported && body.trim() ? body : undefined,
      });
      const durationMs = Math.round(performance.now() - start);
      const text = await res.text();
      const contentType = res.headers.get('content-type') ?? '';
      const bodyIsJson = contentType.includes('application/json');

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body: text,
        bodyIsJson,
        durationMs,
        sizeBytes: new Blob([text]).size,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100 dark:bg-slate-950">
      <AppHeader storageVersion={storageVersion} />

      <div className="flex flex-1 overflow-hidden">
        <SavedRequestsSidebar
          requests={requests}
          activeId={activeId}
          onLoad={loadRequest}
          onDelete={handleDelete}
          onImport={handleImport}
          onNew={resetToNew}
          onClearAll={handleClearAll}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-200 bg-white px-4 pt-3 dark:border-slate-800 dark:bg-slate-900">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Request name"
              className="w-full border-none bg-transparent p-0 pb-2 text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
            />
          </div>

          <RequestBar
            method={method}
            baseUrl={baseUrl}
            path={buildFullPath(path, queryParams)}
            loading={loading}
            onMethodChange={setMethod}
            onBaseUrlChange={setBaseUrl}
            onPathChange={handlePathChange}
            onSend={handleSend}
            onSave={handleSave}
            onDownload={handleDownload}
          />

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
            <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
              <section>
                <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Headers
                </h2>
                <KeyValueEditor pairs={headers} onChange={setHeaders} />
              </section>

              <section>
                <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {bodySupported ? 'Body' : 'URL Params'}
                </h2>
                {bodySupported ? (
                  <BodyEditor value={body} onChange={setBody} />
                ) : (
                  <KeyValueEditor
                    pairs={queryParams}
                    onChange={setQueryParams}
                    keyPlaceholder="Param"
                    valuePlaceholder="Value"
                  />
                )}
              </section>
            </div>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Response
              </h2>
              <ResponseViewer response={response} error={error} loading={loading} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
