import type { SavedApiRequest } from '../types';

const DB_NAME = 'apiToolDB';
const DB_VERSION = 1;
const STORE_NAME = 'requests';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    const req = fn(store);

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

export function getAllSavedRequests(): Promise<SavedApiRequest[]> {
  return withStore('readonly', (store) => store.getAll());
}

export function putSavedRequest(record: SavedApiRequest): Promise<IDBValidKey> {
  return withStore('readwrite', (store) => store.put(record));
}

export function deleteSavedRequest(id: string): Promise<undefined> {
  return withStore('readwrite', (store) => store.delete(id));
}

export function clearAllSavedRequests(): Promise<undefined> {
  return withStore('readwrite', (store) => store.clear());
}
