// src/context/SyncContext.tsx
import React, { createContext, useContext } from 'react';
import { useSync } from '../hooks/useSync';

type SyncContextType = Omit<ReturnType<typeof useSync>, 'needsReload' | 'setNeedsReload'>;

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export const SyncProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const sync = useSync();
    return (
        <SyncContext.Provider value={sync}>
            {children}
        </SyncContext.Provider>
    );
};

export const useSyncContext = () => {
    const context = useContext(SyncContext);
    if (context === undefined) {
        throw new Error('useSyncContext must be used within a SyncProvider');
    }
    return context;
};
