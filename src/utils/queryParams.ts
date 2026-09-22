import type { KeyValuePair } from '../types';
import { generateId } from './format';

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

export function parseQueryString(query: string): KeyValuePair[] {
  return query
    .split('&')
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      const eqIndex = segment.indexOf('=');
      const rawKey = eqIndex === -1 ? segment : segment.slice(0, eqIndex);
      const rawValue = eqIndex === -1 ? '' : segment.slice(eqIndex + 1);
      return {
        id: generateId(),
        key: safeDecode(rawKey),
        value: safeDecode(rawValue),
        enabled: true,
      };
    });
}

export function buildQueryString(params: KeyValuePair[]): string {
  const active = params.filter((p) => p.enabled && p.key.trim() !== '');
  if (active.length === 0) return '';
  return (
    '?' +
    active
      .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value)}`)
      .join('&')
  );
}

export function buildFullPath(base: string, params: KeyValuePair[]): string {
  return `${base}${buildQueryString(params)}`;
}

export function splitPathAndQuery(value: string): { base: string; queryParams: KeyValuePair[] } {
  const qIndex = value.indexOf('?');
  if (qIndex === -1) return { base: value, queryParams: [] };
  return { base: value.slice(0, qIndex), queryParams: parseQueryString(value.slice(qIndex + 1)) };
}
