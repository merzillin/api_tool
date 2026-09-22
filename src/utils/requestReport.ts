import type { ApiResponseData, HttpMethod, KeyValuePair } from '../types';
import { formatBytes } from './format';
import { buildFullPath } from './queryParams';

interface RequestSnapshot {
  name: string;
  method: HttpMethod;
  baseUrl: string;
  path: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  body: string;
  bodySupported: boolean;
  response: ApiResponseData | null;
  error: string | null;
}

function formatResponseBody(body: string, isJson: boolean): string {
  if (!isJson) return body;
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
}

function formatPairs(pairs: KeyValuePair[]): string {
  const enabled = pairs.filter((p) => p.enabled && p.key.trim());
  if (enabled.length === 0) return '    (none)';
  return enabled.map((p) => `    ${p.key.trim()}: ${p.value}`).join('\n');
}

function field(label: string, value: string): string {
  return `  ${label.padEnd(8)}${value}`;
}

export function buildRequestReport(snapshot: RequestSnapshot): string {
  const fullPath = buildFullPath(snapshot.path, snapshot.queryParams);
  const trimmedBase = snapshot.baseUrl.trim().replace(/\/+$/, '');
  const url = trimmedBase ? `${trimmedBase}${fullPath}` : fullPath || '(no URL set)';

  const lines: string[] = [];

  lines.push(`API Request Report — ${new Date().toLocaleString()}`);
  lines.push('');

  lines.push('REQUEST');
  lines.push(field('Name:', snapshot.name.trim() || 'Untitled request'));
  lines.push(field('Method:', snapshot.method));
  lines.push(field('URL:', url));
  lines.push('');
  lines.push('  Headers');
  lines.push(formatPairs(snapshot.headers));

  if (snapshot.bodySupported) {
    lines.push('');
    lines.push('  Body');
    lines.push(snapshot.body.trim() ? snapshot.body : '    (empty)');
  } else if (snapshot.queryParams.some((p) => p.enabled && p.key.trim())) {
    lines.push('');
    lines.push('  Query Params');
    lines.push(formatPairs(snapshot.queryParams));
  }
  lines.push('');

  lines.push('RESPONSE');

  if (snapshot.error) {
    lines.push(field('Error:', snapshot.error));
  } else if (snapshot.response) {
    const r = snapshot.response;
    lines.push(field('Status:', `${r.status} ${r.statusText}`));
    lines.push(field('Time:', `${r.durationMs} ms`));
    lines.push(field('Size:', formatBytes(r.sizeBytes)));

    const headerEntries = Object.entries(r.headers);
    if (headerEntries.length > 0) {
      lines.push('');
      lines.push('  Headers');
      lines.push(headerEntries.map(([key, value]) => `    ${key}: ${value}`).join('\n'));
    }

    lines.push('');
    lines.push('  Body');
    lines.push(
      r.body.trim()
        ? formatResponseBody(r.body, r.bodyIsJson)
            .split('\n')
            .map((l) => `    ${l}`)
            .join('\n')
        : '    (empty)',
    );
  } else {
    lines.push('  Not sent yet.');
  }

  return lines.join('\n');
}

export function downloadRequestReport(snapshot: RequestSnapshot) {
  const text = buildRequestReport(snapshot);
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = snapshot.name.trim().replace(/[^a-z0-9-_]+/gi, '_') || 'api-request';
  link.href = url;
  link.download = `${safeName}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}
