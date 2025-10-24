// src/components/settings/SyncSettings.tsx
import React, { useState, useEffect } from 'react';
import { oneDriveService } from '../../services/onedrive.service';
import { useData } from '../../context/DataContext';
import Button from '../common/Button';

const SyncSettings: React.FC = () => {
    const { appData, loadData } = useData();
    const [isSignedIn, setIsSignedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);

    useEffect(() => {
        const clientId = 'bd453050-3e3c-470a-8db7-16c479b30ec7';
        oneDriveService.init(clientId).then(() => {
            const signedIn = oneDriveService.isSignedIn();
            setIsSignedIn(signedIn);
            if (signedIn) {
                setUserInfo(oneDriveService.getUserInfo());
            }
            setIsLoading(false);
        });
    }, []);

    const handleSignIn = async () => {
        try {
            await oneDriveService.signIn();
            const signedIn = oneDriveService.isSignedIn();
            setIsSignedIn(signedIn);
            if (signedIn) {
                setUserInfo(oneDriveService.getUserInfo());
            }
        } catch (error) {
            console.error(error);
            alert('Failed to sign in. See console for details.');
        }
    };

    const handleSignOut = async () => {
        await oneDriveService.signOut();
        setIsSignedIn(false);
        setUserInfo(null);
    };

    const handleSync = async () => {
        if (!appData) {
            alert('No local data to sync.');
            return;
        }
        setIsLoading(true);
        try {
            const result = await oneDriveService.sync(appData.metadata.lastModified);
            
            if (result.action === 'upload') {
                await oneDriveService.uploadData(appData);
                alert('Local data uploaded to OneDrive.');
            } else if (result.action === 'download') {
                if (result.remoteData) {
                    loadData(result.remoteData);
                    alert('Remote data downloaded from OneDrive.');
                }
            } else {
                alert('Data is already up to date.');
            }
        } catch (error) {
            console.error(error);
            alert('Sync failed. See console for details.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div>Loading Sync Settings...</div>;
    }

    return (
        <div>
            <h3>OneDrive Sync</h3>
            {isSignedIn && userInfo ? (
                <div>
                    <p>Signed in as: {userInfo.name} ({userInfo.email})</p>
                    <Button onClick={handleSync} disabled={isLoading}>
                        {isLoading ? 'Syncing...' : 'Sync Now'}
                    </Button>
                    <Button onClick={handleSignOut} style={{ marginLeft: '10px' }}>Sign Out</Button>
                </div>
            ) : (
                <div>
                    <p>Sign in to your Microsoft account to enable cloud sync.</p>
                    <Button onClick={handleSignIn}>Sign In with Microsoft</Button>
                </div>
            )}
        </div>
    );
};

export default SyncSettings;