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
const memoryStorage = new Map<string, string>();
vi.stubGlobal('localStorage', {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => void memoryStorage.set(k, v),
  removeItem: (k: string) => void memoryStorage.delete(k),
});

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

    it('falls back to the salt embedded in the vault file when metadata is missing', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: {} }, 404)) // salt metadata
        .mockResolvedValueOnce(jsonResponse(metadata())) // vault metadata
        .mockResolvedValueOnce(jsonResponse(REMOTE)); // vault content

      expect(await saltRecoveryService.getFromOneDrive()).toBe(REMOTE.salt);
      expect(fetchMock.mock.calls[1][0]).toContain('approot:/lockt-data.encrypted');
    });

    it('returns null when neither salt metadata nor vault file exists', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse({ error: {} }, 404))
        .mockResolvedValueOnce(jsonResponse({ error: {} }, 404));

      expect(await saltRecoveryService.getFromOneDrive()).toBeNull();
    });
  });

  describe('saltRecoveryService OneDrive recovery metadata', () => {
    const ESCROW = { iv: 'ZXNj', salt: 'ZXNj', ciphertext: 'ZXNjcm93', version: 1 };
    const OTHER_ESCROW = { iv: 'b3Ro', salt: 'b3Ro', ciphertext: 'b3RoZXI=', version: 1 };

    // GET metadata item, then GET its content via downloadUrl
    const existingFile = (content: unknown) => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(metadata()))
        .mockResolvedValueOnce(jsonResponse(content));
    };
    const noFile = () => fetchMock.mockResolvedValueOnce(jsonResponse({ error: {} }, 404));
    const putOk = () => fetchMock.mockResolvedValueOnce(jsonResponse({ id: 'x' }));
    const putCalls = () => fetchMock.mock.calls.filter(([, init]) => init?.method === 'PUT');
    const putBody = () => JSON.parse(putCalls()[0][1].body);

    it('saving salt alone keeps the escrow already stored for the same salt', async () => {
      existingFile({ salt: 'SALT1', encryptedPassword: ESCROW, version: 2, createdAt: 1 });
      await saltRecoveryService.saveSaltBackups('SALT1');
      expect(putCalls()).toHaveLength(0); // already up to date
    });

    it('saving a new salt drops the escrow that belonged to the old salt', async () => {
      existingFile({ salt: 'OLD', encryptedPassword: ESCROW, version: 2, createdAt: 1 });
      putOk();
      await saltRecoveryService.saveSaltBackups('NEW');
      expect(putBody()).toMatchObject({ salt: 'NEW', version: 2 });
      expect(putBody().encryptedPassword).toBeUndefined();
    });

    it('saving salt with escrow uploads both', async () => {
      noFile();
      putOk();
      await saltRecoveryService.saveSaltBackups('SALT1', ESCROW);
      expect(putBody()).toMatchObject({ salt: 'SALT1', encryptedPassword: ESCROW, version: 2 });
    });

    it('backfill adds a missing escrow for the same salt', async () => {
      existingFile({ salt: 'SALT2', version: 1, createdAt: 1 });
      existingFile({ salt: 'SALT2', version: 1, createdAt: 1 }); // re-read inside save
      putOk();
      await saltRecoveryService.backfillOneDriveBackup('SALT2', ESCROW);
      expect(putBody()).toMatchObject({ salt: 'SALT2', encryptedPassword: ESCROW });
    });

    it('backfill never replaces an escrow already on OneDrive', async () => {
      existingFile({ salt: 'SALT3', encryptedPassword: OTHER_ESCROW, version: 2, createdAt: 1 });
      await saltRecoveryService.backfillOneDriveBackup('SALT3', ESCROW);
      expect(putCalls()).toHaveLength(0);
    });

    it('backfill does nothing when OneDrive has a different salt (password changed elsewhere)', async () => {
      existingFile({ salt: 'NEWER', encryptedPassword: OTHER_ESCROW, version: 2, createdAt: 1 });
      await saltRecoveryService.backfillOneDriveBackup('STALE', ESCROW);
      expect(putCalls()).toHaveLength(0);
    });

    it('backfill creates the file when it is missing, and only checks once per session', async () => {
      noFile();
      noFile();
      putOk();
      await saltRecoveryService.backfillOneDriveBackup('SALT4', ESCROW);
      expect(putBody()).toMatchObject({ salt: 'SALT4', encryptedPassword: ESCROW });

      fetchMock.mockClear();
      await saltRecoveryService.backfillOneDriveBackup('SALT4', ESCROW);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('getOneDriveEscrow returns the stored escrow', async () => {
      existingFile({ salt: 'SALT5', encryptedPassword: ESCROW, version: 2, createdAt: 1 });
      expect(await saltRecoveryService.getOneDriveEscrow()).toEqual(ESCROW);
    });
  });
});
