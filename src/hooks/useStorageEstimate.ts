import { useEffect, useState } from 'react';

export interface StorageEstimate {
  usage: number;
  quota: number;
  supported: boolean;
}

export function useStorageEstimate(refreshKey: number): StorageEstimate {
  const [estimate, setEstimate] = useState<StorageEstimate>({
    usage: 0,
    quota: 0,
    supported: false,
  });

  useEffect(() => {
    let cancelled = false;

    if (!navigator.storage?.estimate) {
      setEstimate((prev) => ({ ...prev, supported: false }));
      return;
    }

    navigator.storage
      .estimate()
      .then(({ usage = 0, quota = 0 }) => {
        if (!cancelled) setEstimate({ usage, quota, supported: true });
      })
      .catch(() => {
        if (!cancelled) setEstimate((prev) => ({ ...prev, supported: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return estimate;
}
