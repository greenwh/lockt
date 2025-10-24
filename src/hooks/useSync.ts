// src/hooks/useSync.ts
import { useState, useEffect, useCallback } from 'react';
import { oneDriveService } from '../services/onedrive.service';
import { databaseService } from '../services/database.service';
import { useData } from '../context/DataContext';

export const useSync = () => {
    const { appData, loadData } = useData();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    const sync = useCallback(async () => {
        if (!oneDriveService.isSignedIn()) {
            setSyncError("Not signed in to OneDrive.");
            return;
        }

        setIsSyncing(true);
        setSyncError(null);

        try {
            const localData = await databaseService.getData();
            if (!localData) {
                // Maybe download?
                setIsSyncing(false);
                return;
            }

            const result = await oneDriveService.sync(localData.metadata.lastModified);

            if (result.action === 'upload') {
                await oneDriveService.uploadData(localData);
                setLastSynced(new Date());
            } else if (result.action === 'download' && result.remoteData) {
                loadData(result.remoteData);
                setLastSynced(new Date(result.remoteTimestamp!));
            } else {
                // Data is up to date
                setLastSynced(new Date());
            }
        } catch (error) {
            console.error("Sync failed:", error);
            setSyncError(error instanceof Error ? error.message : String(error));
        } finally {
            setIsSyncing(false);
        }
    }, [appData, loadData]);

    useEffect(() => {
        // You might want to trigger sync periodically or on certain events
    }, [sync]);

    return { isSyncing, lastSynced, syncError, sync };
};
