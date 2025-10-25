// src/services/onedrive.service.ts

import { PublicClientApplication, InteractionRequiredAuthError } from '@azure/msal-browser';
import type { AccountInfo } from '@azure/msal-browser';
import type { EncryptedData } from '../types/data.types';
import { msalConfig, loginRequest } from '../config/auth.config';

interface OneDriveFileMetadata {
  lastModifiedDateTime: string;
  size: number;
  id: string;
}

export interface SyncResult {
  action: 'upload' | 'download' | 'conflict' | 'none';
  remoteData?: EncryptedData;
  remoteTimestamp?: number;
  localData?: EncryptedData;
  localTimestamp?: number;
}

class OneDriveService {
  private msalInstance: PublicClientApplication;
  private readonly FILE_NAME = 'lockt-data.encrypted';
  private readonly GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

  constructor() {
    this.msalInstance = new PublicClientApplication(msalConfig);
  }

  /**
   * Initialize MSAL authentication
   */
  async init(): Promise<void> {
    await this.msalInstance.initialize();

    // Handle redirect response
    await this.msalInstance.handleRedirectPromise();
  }

  /**
   * Sign in to Microsoft account
   */
  async signIn(): Promise<AccountInfo> {
    try {
      const response = await this.msalInstance.loginPopup(loginRequest);
      return response.account;
    } catch (error) {
      console.error('OneDrive sign-in failed:', error);
      throw new Error('Failed to sign in to OneDrive');
    }
  }

  /**
   * Get access token for Graph API calls
   */
  private async getAccessToken(): Promise<string> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No signed-in account found');
    }

    try {
      const response = await this.msalInstance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });
      return response.accessToken;
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError) {
        // Fallback to interactive login
        const response = await this.msalInstance.acquireTokenPopup(loginRequest);
        return response.accessToken;
      }
      throw error;
    }
  }

  /**
   * Get access token (public method for other services)
   */
  async getToken(): Promise<string> {
    return this.getAccessToken();
  }

  /**
   * Get current account
   */
  getAccount(): AccountInfo | null {
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    return this.msalInstance.getAllAccounts().length > 0;
  }

  /**
   * Sign out of Microsoft account
   */
  async signOut(): Promise<void> {
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await this.msalInstance.logoutPopup({
        account: accounts[0],
      });
    }
  }

  /**
   * Upload encrypted data to OneDrive
   */
  async uploadData(encryptedData: EncryptedData): Promise<void> {
    try {
      const token = await this.getAccessToken();

      const fileContent = JSON.stringify(encryptedData);
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}:/content`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: fileContent,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.statusText} - ${errorText}`);
      }
    } catch (error) {
      console.error('OneDrive upload failed:', error);
      throw new Error('Failed to upload data to OneDrive');
    }
  }

  /**
   * Download encrypted data from OneDrive
   */
  async downloadData(): Promise<EncryptedData | null> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}:/content`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return null; // File doesn't exist yet
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data as EncryptedData;
    } catch (error) {
      console.error('OneDrive download failed:', error);
      throw new Error('Failed to download data from OneDrive');
    }
  }

  /**
   * Get file metadata (for sync comparison)
   */
  async getFileMetadata(): Promise<OneDriveFileMetadata | null> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Metadata fetch failed: ${response.statusText} - ${errorText}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('OneDrive metadata fetch failed:', error);
      return null;
    }
  }

  /**
   * Sync logic: Compare local and remote timestamps
   * Detects conflicts when both local and remote have been modified since last sync
   */
  async sync(
    localData: EncryptedData | null,
    localTimestamp: number,
    lastSyncTime?: number
  ): Promise<SyncResult> {
    const metadata = await this.getFileMetadata();

    // No remote file - upload local
    if (!metadata) {
      return { action: 'upload' };
    }

    const remoteTimestamp = new Date(metadata.lastModifiedDateTime).getTime();

    // No local data - download remote
    if (!localData) {
      const remoteData = await this.downloadData();
      return {
        action: 'download',
        remoteData: remoteData!,
        remoteTimestamp,
      };
    }

    // Check for conflict: both modified since last sync
    if (lastSyncTime) {
      const localModifiedSinceSync = localTimestamp > lastSyncTime;
      const remoteModifiedSinceSync = remoteTimestamp > lastSyncTime;

      if (localModifiedSinceSync && remoteModifiedSinceSync) {
        // CONFLICT: Both sides modified since last sync
        const remoteData = await this.downloadData();
        return {
          action: 'conflict',
          localData,
          localTimestamp,
          remoteData: remoteData!,
          remoteTimestamp,
        };
      }
    }

    // Remote is newer - download
    if (remoteTimestamp > localTimestamp) {
      const remoteData = await this.downloadData();
      return {
        action: 'download',
        remoteData: remoteData!,
        remoteTimestamp,
      };
    }

    // Local is newer - upload
    if (localTimestamp > remoteTimestamp) {
      return { action: 'upload' };
    }

    // Same timestamp - no action needed
    return { action: 'none' };
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }
}

export const oneDriveService = new OneDriveService();
