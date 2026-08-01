import { useSyncExternalStore, useCallback } from 'react';
import { SubsonicClient } from '@choral/api';

export function useUpdatedMedia(client: SubsonicClient | null) {
  // Wrappd in useCallback to avoid recreating subscribe on every render
  const subscribe = useCallback(
    (onMediaChange: () => void) => {
      if (!client) return () => {};
      return client.subscribe(onMediaChange); // Call onMediaChange whenever client notifies listeners
    },
    [client]
  );

  const getSnapshot = useCallback(() => client?.updatedMedia, [client]);

  // On media changing, run getSnapshot and compare it to previous value
  // If a change has occurred, useUpdatedMedia with return the new value on re-render
  return useSyncExternalStore(subscribe, getSnapshot);
}
