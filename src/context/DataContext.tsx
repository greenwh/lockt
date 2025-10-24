// src/context/DataContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { databaseService } from '../services/database.service';
import type { AppData, PasswordEntry, CreditCardEntry, CryptoEntry, FreetextEntry, HealthData } from '../types/data.types';

type DataEntityType = 'passwords' | 'creditCards' | 'crypto' | 'freetext';

interface DataContextType {
    appData: AppData;
    loading: boolean;
    addEntry: (entity: DataEntityType, data: Omit<PasswordEntry | CreditCardEntry | CryptoEntry | FreetextEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateEntry: (entity: DataEntityType, id: string, data: Partial<PasswordEntry | CreditCardEntry | CryptoEntry | FreetextEntry>) => void;
    deleteEntry: (entity: DataEntityType, id: string) => void;
    updateHealthData: (data: Partial<HealthData>) => void;
    loadData: (data: AppData) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const initialAppData: AppData = {
    passwords: [],
    creditCards: [],
    crypto: [],
    freetext: [],
    health: {
        providers: [],
        conditions: [],
        impairments: [],
        journal: []
    },
    metadata: {
        version: 1,
        lastModified: Date.now(),
        deviceId: uuidv4(),
    }
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [appData, setAppData] = useState<AppData>(initialAppData);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            const data = await databaseService.getData();
            if (data) {
                setAppData(data);
            } else {
                // First time launch, save initial data
                await databaseService.saveData(initialAppData);
            }
            setLoading(false);
        };
        loadInitialData();
    }, []);

    const saveData = async (data: AppData) => {
        const updatedData = {
            ...data,
            metadata: {
                ...data.metadata,
                lastModified: Date.now(),
            }
        };
        setAppData(updatedData);
        await databaseService.saveData(updatedData);
    };
    
    const loadData = (data: AppData) => {
        setAppData(data);
        databaseService.saveData(data);
    }

    const addEntry = (entity: DataEntityType, data: Omit<any, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newEntry = {
            ...data,
            id: uuidv4(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        const newData = { ...appData, [entity]: [...appData[entity], newEntry] };
        saveData(newData);
    };

    const updateEntry = (entity: DataEntityType, id: string, data: Partial<any>) => {
        const updatedEntries = appData[entity].map((e: any) =>
            e.id === id ? { ...e, ...data, updatedAt: Date.now() } : e
        );
        const newData = { ...appData, [entity]: updatedEntries };
        saveData(newData);
    };

    const deleteEntry = (entity: DataEntityType, id: string) => {
        const updatedEntries = appData[entity].filter((e: any) => e.id !== id);
        const newData = { ...appData, [entity]: updatedEntries };
        saveData(newData);
    };

    const updateHealthData = (data: Partial<HealthData>) => {
        const newHealthData = { ...appData.health, ...data };
        const newData = { ...appData, health: newHealthData };
        saveData(newData);
    };

    return (
        <DataContext.Provider value={{ appData, loading, addEntry, updateEntry, deleteEntry, updateHealthData, loadData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};