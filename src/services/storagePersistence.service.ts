// src/services/storagePersistence.service.ts

/**
 * Persistent storage (navigator.storage.persist).
 *
 * Without it, the browser may evict Lockt's IndexedDB/localStorage under storage
 * pressure. Chrome/Edge grant it silently for installed/engaged sites; Firefox
 * asks the user once. It does NOT protect against the user (or a browser setting
 * like Firefox's "Delete cookies and site data when Firefox is closed") clearing
 * site data — an encrypted backup file and OneDrive cover that.
 */

export type PersistenceStatus = 'persisted' | 'not-persisted' | 'unsupported';

class StoragePersistenceService {
  private isSupported(): boolean {
    return typeof navigator !== 'undefined' && !!navigator.storage?.persist && !!navigator.storage?.persisted;
  }

  async getStatus(): Promise<PersistenceStatus> {
    if (!this.isSupported()) return 'unsupported';
    try {
      return (await navigator.storage.persisted()) ? 'persisted' : 'not-persisted';
    } catch {
      return 'unsupported';
    }
  }

  /**
   * Ask the browser to keep Lockt's data. Returns the resulting status.
   */
  async request(): Promise<PersistenceStatus> {
    if (!this.isSupported()) return 'unsupported';
    try {
      if (await navigator.storage.persisted()) return 'persisted';
      return (await navigator.storage.persist()) ? 'persisted' : 'not-persisted';
    } catch (error) {
      console.error('Persistent storage request failed:', error);
      return this.getStatus();
    }
  }
}

export const storagePersistenceService = new StoragePersistenceService();
