import { useCallback, useEffect, useState } from 'react';
import {
  clearAllSavedRequests,
  deleteSavedRequest,
  getAllSavedRequests,
  putSavedRequest,
} from '../db/savedRequestsDb';
import type { SavedApiRequest } from '../types';

export function useSavedRequests() {
  const [requests, setRequests] = useState<SavedApiRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const all = await getAllSavedRequests();
      all.sort((a, b) => b.updatedAt - a.updatedAt);
      setRequests(all);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, version]);

  const save = useCallback(async (record: SavedApiRequest) => {
    await putSavedRequest(record);
    setVersion((v) => v + 1);
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteSavedRequest(id);
    setVersion((v) => v + 1);
  }, []);

  const clearAll = useCallback(async () => {
    await clearAllSavedRequests();
    setVersion((v) => v + 1);
  }, []);

  return { requests, loading, save, remove, clearAll, storageVersion: version };
}
