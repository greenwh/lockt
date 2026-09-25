// src/services/onedrive.service.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@azure/msal-browser', () => {
  class PublicClientApplication {
    static initializeCalls = 0;
    initialized = false;
    async initialize() {
      PublicClientApplication.initializeCalls++;
      await new Promise((r) => setTimeout(r, 5));
      this.initialized = true;
    }
    async handleRedirectPromise() {
      return null;
    }
    getAllAccounts() {
      if (!this.initialized) throw new Error('uninitialized_public_client_application');
      return [{ homeAccountId: 'acct' }];
    }
    async acquireTokenSilent() {
      return { accessToken: 'test-token' };
    }
  }
  class InteractionRequiredAuthError extends Error {}
  return { PublicClientApplication, InteractionRequiredAuthError };
});

// auth.config reads window.location at import time
vi.stubGlobal('window', { location: { hostname: 'localhost' } });

const { oneDriveService } = await import('./onedrive.service');
const { saltRecoveryService } = await import('./saltRecovery.service');
const { PublicClientApplication } = (await import('@azure/msal-browser')) as unknown as {
  PublicClientApplication: { initializeCalls: number };
};

const REMOTE = { iv: 'iv', salt: 'salt', ciphertext: 'ct', version: 1 };
const DOWNLOAD_URL = 'https://public.dm.files.1drv.com/presigned';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, statusText: status === 200 ? 'OK' : 'Error' });
}

function metadata(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ITEM123',
    size: 42,
    lastModifiedDateTime: '2026-09-25T12:00:00Z',
    '@microsoft.graph.downloadUrl': DOWNLOAD_URL,
    ...overrides,
  };
}

describe('oneDriveService', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Must run first: MSAL starts uninitialized and init() is memoized per instance.
  describe('startup before MSAL is initialized', () => {
    it('salt backup check waits for MSAL init instead of throwing', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(metadata()))
        .mockResolvedValueOnce(jsonResponse({ salt: 'abc123', version: 1 }));

      // Mirrors App.tsx startup: nothing has called oneDriveService.init() yet
      const status = await saltRecoveryService.hasBackups();

      expect(status.oneDrive).toBe(true);
      expect(PublicClientApplication.initializeCalls).toBe(1);
    });

    it('init() is memoized across concurrent callers', async () => {
      await Promise.all([oneDriveService.init(), oneDriveService.init(), oneDriveService.init()]);
      expect(PublicClientApplication.initializeCalls).toBe(1);
    });
  });

  describe('downloadData', () => {
    it('downloads via the pre-authenticated downloadUrl without an auth header', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(metadata()))
        .mockResolvedValueOnce(jsonResponse(REMOTE));

      const data = await oneDriveService.downloadData();

      expect(data).toEqual(REMOTE);
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(fetchMock.mock.calls[0][0]).toContain('/me/drive/special/approot:/lockt-data.encrypted');
      expect(fetchMock.mock.calls[0][0]).not.toContain(':/content');
      expect(fetchMock.mock.calls[1]).toEqual([DOWNLOAD_URL]);
    });

    it('falls back to /items/{id}/content when downloadUrl is absent', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(metadata({ '@microsoft.graph.downloadUrl': undefined })))
        .mockResolvedValueOnce(jsonResponse(REMOTE));

      const data = await oneDriveService.downloadData();

      expect(data).toEqual(REMOTE);
      const [url, init] = fetchMock.mock.calls[1];
      expect(url).toBe('https://graph.microsoft.com/v1.0/me/drive/items/ITEM123/content');
      expect(init.headers.Authorization).toBe('Bearer test-token');
    });

    it('returns null when the remote file does not exist', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: {} }, 404));

      expect(await oneDriveService.downloadData()).toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('throws when the content download fails', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(metadata()))
        .mockResolvedValueOnce(jsonResponse({ error: {} }, 400));

      await expect(oneDriveService.downloadData()).rejects.toThrow('Failed to download data from OneDrive');
    });
  });

  describe('getFileMetadata / sync', () => {
    it('throws on non-404 errors instead of reporting "no remote file"', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: {} }, 401));

      await expect(oneDriveService.getFileMetadata()).rejects.toThrow('401');
    });

    it('sync does not choose upload when the metadata check fails', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: {} }, 403));

      await expect(oneDriveService.sync(REMOTE as never, Date.now())).rejects.toThrow();
    });

    it('sync chooses upload only when the remote file is genuinely missing', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: {} }, 404));

      const result = await oneDriveService.sync(REMOTE as never, Date.now());
      expect(result.action).toBe('upload');
    });

    it('sync downloads remote data when there is no local data', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(metadata()))
        .mockResolvedValueOnce(jsonResponse(metadata()))
        .mockResolvedValueOnce(jsonResponse(REMOTE));

      const result = await oneDriveService.sync(null, 0);
      expect(result.action).toBe('download');
      expect(result.remoteData).toEqual(REMOTE);
    });
  });

  describe('saltRecoveryService.getFromOneDrive', () => {
    it('downloads salt metadata via downloadUrl, not path-based :/content', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(metadata()))
        .mockResolvedValueOnce(jsonResponse({ salt: 'abc123', version: 1 }));

      expect(await saltRecoveryService.getFromOneDrive()).toBe('abc123');
      expect(fetchMock.mock.calls[0][0]).toContain('approot:/lockt-salt-metadata.json');
      expect(fetchMock.mock.calls[0][0]).not.toContain(':/content');
      expect(fetchMock.mock.calls[1]).toEqual([DOWNLOAD_URL]);
    });

    it('returns null when no salt metadata exists', async () => {
      fetchMock.mockResolvedValueOnce(jsonResponse({ error: {} }, 404));

      expect(await saltRecoveryService.getFromOneDrive()).toBeNull();
    });
  });
});
