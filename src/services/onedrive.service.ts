// src/services/onedrive.service.ts

import { PublicClientApplication } from '@azure/msal-browser';
import type { AppData } from '../types/data.types';

interface OneDriveFileMetadata {
  lastModifiedDateTime: string;
  size: number;
  id: string;
}

/**
 * OneDrive Service
 * Handles syncing plain JSON data to OneDrive
 * NO ENCRYPTION - OneDrive handles encryption at rest and in transit
 */
class OneDriveService {
  private msalInstance: PublicClientApplication | null = null;
  private readonly SCOPES = ['Files.ReadWrite.AppFolder'];
  private readonly FILE_NAME = 'lockt-data.json';  // Plain JSON, not encrypted
  private readonly GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0';

  /**
   * Initialize MSAL authentication
   */
  async init(clientId: string): Promise<void> {
    this.msalInstance = new PublicClientApplication({
      auth: {
        clientId: clientId,
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
      }
    });

    await this.msalInstance.initialize();
  }

  /**
   * Sign in to Microsoft account
   */
  async signIn(): Promise<void> {
    if (!this.msalInstance) {
      throw new Error('OneDrive service not initialized');
    }

    try {
      await this.msalInstance.loginPopup({
        scopes: this.SCOPES
      });
    } catch (error) {
      console.error('OneDrive sign-in failed:', error);
      throw new Error('Failed to sign in to OneDrive');
    }
  }

  /**
   * Get access token for Graph API calls
   */
  private async getAccessToken(): Promise<string> {
    if (!this.msalInstance) {
      throw new Error('OneDrive service not initialized');
    }

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      throw new Error('No signed-in account found');
    }

    const response = await this.msalInstance.acquireTokenSilent({
      scopes: this.SCOPES,
      account: accounts[0]
    });

    return response.accessToken;
  }

  /**
   * Check if user is signed in
   */
  isSignedIn(): boolean {
    if (!this.msalInstance) return false;
    return this.msalInstance.getAllAccounts().length > 0;
  }

  /**
   * Sign out of Microsoft account
   */
  async signOut(): Promise<void> {
    if (!this.msalInstance) return;
    
    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length > 0) {
      await this.msalInstance.logoutPopup({
        account: accounts[0]
      });
    }
  }

  /**
   * Upload data to OneDrive
   */
  async uploadData(data: AppData): Promise<void> {
    try {
      const token = await this.getAccessToken();
      
      // Convert data to JSON string
      const fileContent = JSON.stringify(data, null, 2);
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}:/content`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: fileContent
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('OneDrive upload failed:', error);
      throw new Error('Failed to upload data to OneDrive');
    }
  }

  /**
   * Download data from OneDrive
   */
  async downloadData(): Promise<AppData | null> {
    try {
      const token = await this.getAccessToken();
      const endpoint = `${this.GRAPH_ENDPOINT}/me/drive/special/approot:/${this.FILE_NAME}:/content`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        return null; // File doesn't exist yet
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data as AppData;
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
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Metadata fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OneDrive metadata fetch failed:', error);
      return null;
    }
  }

  /**
   * Sync logic: Compare local and remote timestamps
   * OneDrive handles conflict resolution automatically
   */
  async sync(
    localTimestamp: number
  ): Promise<{
    action: 'upload' | 'download' | 'none';
    remoteData?: AppData;
    remoteTimestamp?: number;
  }> {
    const metadata = await this.getFileMetadata();

    // No remote file - upload local
    if (!metadata) {
      return { action: 'upload' };
    }

    const remoteTimestamp = new Date(metadata.lastModifiedDateTime).getTime();

    // Remote is newer - download
    if (remoteTimestamp > localTimestamp) {
      const remoteData = await this.downloadData();
      return {
        action: 'download',
        remoteData: remoteData!,
        remoteTimestamp
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
   * Get user info (for display)
   */
  getUserInfo(): { name: string; email: string } | null {
    if (!this.msalInstance) return null;

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) return null;

    const account = accounts[0];
    return {
      name: account.name || 'Unknown',
      email: account.username
    };
  }
}

export const oneDriveService = new OneDriveService();
