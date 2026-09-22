export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'DELETE'
  | 'HEAD'
  | 'OPTIONS';

export const HTTP_METHODS: HttpMethod[] = [
  'GET',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'HEAD',
  'OPTIONS',
];

export const METHODS_WITH_BODY: HttpMethod[] = ['POST', 'PUT', 'PATCH', 'DELETE'];

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface SavedApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  baseUrl: string;
  path: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  body: string;
  createdAt: number;
  updatedAt: number;
}

export interface ApiResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  bodyIsJson: boolean;
  durationMs: number;
  sizeBytes: number;
}
