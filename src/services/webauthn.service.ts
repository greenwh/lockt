// src/services/webauthn.service.ts

import type { EncryptedData } from '../types/data.types';

/**
 * WebAuthn Credential stored in IndexedDB
 *
 * SECURITY MODEL (v2 - PRF based):
 * The master password is encrypted with an AES-GCM key derived from the
 * WebAuthn PRF (Pseudo-Random Function) extension output. The PRF output is a
 * stable, high-entropy secret that the authenticator only releases AFTER a
 * successful biometric/user-verification check, and it is NEVER stored on disk.
 *
 * Crucially, the values stored here (credential id, public key, prfSalt) are
 * NOT sufficient to derive the encryption key — an attacker with full read
 * access to IndexedDB still cannot decrypt `encryptedPassword` without passing
 * the biometric check on the authenticator. This is the property the previous
 * (credential-id-derived) scheme lacked.
 */
export interface BiometricCredential {
  id: string; // Base64-encoded credential ID
  publicKey: string; // Base64-encoded public key (informational)
  encryptedPassword: EncryptedData; // Password encrypted with PRF-derived key
  /**
   * Per-credential salt fed to the PRF as its `first` input. Not secret — it
   * only personalizes the PRF output per credential. Absent on legacy (v1)
   * credentials, which are rejected and must be re-enrolled.
   */
  prfSalt?: string; // Base64-encoded
  deviceName: string; // User-friendly device label
  authenticatorType: 'platform' | 'cross-platform';
  createdAt: number;
  lastUsedAt: number;
}

/**
 * WebAuthn Service
 * Handles biometric authentication using the WebAuthn PRF extension.
 */
class WebAuthnService {
  private readonly RP_NAME = 'Lockt';
  private readonly RP_ID = window.location.hostname;
  private readonly HKDF_INFO = 'lockt-biometric-prf-v2';

  /**
   * Check if WebAuthn is supported in this browser
   */
  isSupported(): boolean {
    return !!(
      window.PublicKeyCredential &&
      navigator.credentials &&
      navigator.credentials.create
    );
  }

  /**
   * Check if platform authenticator (Face ID, Touch ID, Windows Hello) is available
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
      return false;
    }
  }

  /**
   * Get user-friendly authenticator type name
   */
  getAuthenticatorName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('iPhone') || ua.includes('iPad')) {
      return 'Face ID / Touch ID';
    } else if (ua.includes('Mac')) {
      return 'Touch ID';
    } else if (ua.includes('Windows')) {
      return 'Windows Hello';
    } else if (ua.includes('Android')) {
      return 'Fingerprint / Face Unlock';
    }
    return 'Biometric Authentication';
  }

  /**
   * Convert ArrayBuffer or Uint8Array to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert Base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Generate random challenge for WebAuthn
   */
  private generateChallenge(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  /**
   * Derive an AES-GCM key from a PRF output using HKDF.
   * The PRF output is high-entropy (>= 32 bytes), so HKDF (not PBKDF2) is the
   * correct KDF here — no iteration count is needed for non-password inputs.
   */
  private async deriveKeyFromPrf(
    prfOutput: ArrayBuffer,
    hkdfSalt: Uint8Array
  ): Promise<CryptoKey> {
    const prfKey = await crypto.subtle.importKey(
      'raw',
      prfOutput,
      'HKDF',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: hkdfSalt as BufferSource,
        info: new TextEncoder().encode(this.HKDF_INFO),
      },
      prfKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Obtain the PRF output for a given credential by performing a user-verifying
   * assertion. Triggers the biometric prompt. Returns the raw PRF bytes plus the
   * credential id that actually responded.
   */
  private async evaluatePrf(
    credentialIds: string[],
    prfSaltByCredential: Map<string, ArrayBuffer>
  ): Promise<{ credentialId: string; prfOutput: ArrayBuffer }> {
    const challenge = this.generateChallenge();

    // Build per-credential PRF eval inputs (keyed by credential id buffers).
    const evalByCredential: Record<string, { first: BufferSource }> = {};
    for (const id of credentialIds) {
      const salt = prfSaltByCredential.get(id);
      if (salt) {
        // evalByCredential is keyed by base64url credential id (no padding).
        const b64url = id.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        evalByCredential[b64url] = { first: new Uint8Array(salt) };
      }
    }

    const publicKeyOptions: PublicKeyCredentialRequestOptions & {
      extensions?: { prf?: { evalByCredential?: Record<string, { first: BufferSource }> } };
    } = {
      challenge: challenge as BufferSource,
      allowCredentials: credentialIds.map((id) => ({
        id: this.base64ToArrayBuffer(id),
        type: 'public-key',
        transports: ['internal'],
      })),
      userVerification: 'required',
      timeout: 60000,
      rpId: this.RP_ID,
      extensions: { prf: { evalByCredential } },
    };

    const assertion = (await navigator.credentials.get({
      publicKey: publicKeyOptions as PublicKeyCredentialRequestOptions,
    })) as PublicKeyCredential;

    if (!assertion) {
      throw new Error('Authentication failed');
    }

    const credentialId = this.arrayBufferToBase64(assertion.rawId);

    const extResults = assertion.getClientExtensionResults() as {
      prf?: { results?: { first?: ArrayBuffer } };
    };
    const prfOutput = extResults?.prf?.results?.first;

    if (!prfOutput) {
      throw new Error(
        'This device/browser does not support the WebAuthn PRF extension, ' +
          'which Lockt requires for secure biometric unlock. Please use your ' +
          'master password.'
      );
    }

    return { credentialId, prfOutput };
  }

  /**
   * Register new WebAuthn credential (enrollment)
   * @param userId - Unique user identifier (can use deviceId)
   * @param userName - User display name (e.g., "My Device")
   * @param password - Current master password to encrypt
   */
  async registerCredential(
    userId: string,
    userName: string,
    password: string
  ): Promise<BiometricCredential> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      const challenge = this.generateChallenge();

      const publicKeyOptions: PublicKeyCredentialCreationOptions & {
        extensions?: { prf?: Record<string, never> };
      } = {
        challenge: challenge as BufferSource,
        rp: {
          name: this.RP_NAME,
          id: this.RP_ID,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userName,
          displayName: userName,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none',
        // Request the PRF extension on this credential.
        extensions: { prf: {} },
      };

      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions as PublicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Verify the authenticator actually supports PRF before we rely on it.
      const createExt = credential.getClientExtensionResults() as {
        prf?: { enabled?: boolean };
      };
      if (createExt?.prf?.enabled === false) {
        throw new Error(
          'This device does not support the secure biometric unlock method ' +
            '(WebAuthn PRF) that Lockt requires. Biometric unlock was not enabled; ' +
            'your master password still works as normal.'
        );
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = this.arrayBufferToBase64(credential.rawId);
      const publicKeyBytes = response.getPublicKey();
      const publicKey = publicKeyBytes ? this.arrayBufferToBase64(publicKeyBytes) : '';

      // Per-credential PRF salt + HKDF salt.
      const prfSalt = crypto.getRandomValues(new Uint8Array(32));
      const hkdfSalt = crypto.getRandomValues(new Uint8Array(16));

      // Obtain the PRF output (requires a user-verifying assertion).
      const { prfOutput } = await this.evaluatePrf(
        [credentialId],
        new Map([[credentialId, prfSalt.buffer]])
      );

      // Derive AES key and encrypt the password.
      const key = await this.deriveKeyFromPrf(prfOutput, hkdfSalt);
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        new TextEncoder().encode(password)
      );

      const encryptedPassword: EncryptedData = {
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(hkdfSalt),
        ciphertext: this.arrayBufferToBase64(ciphertext),
        version: 2,
      };

      return {
        id: credentialId,
        publicKey,
        encryptedPassword,
        prfSalt: this.arrayBufferToBase64(prfSalt),
        deviceName: userName,
        authenticatorType: 'platform',
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      };
    } catch (error) {
      console.error('WebAuthn registration failed:', error instanceof Error ? error.name : 'unknown');
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Biometric registration was cancelled or not allowed');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Biometric authentication is not supported on this device');
        } else if (error.name === 'InvalidStateError') {
          throw new Error('This device is already registered for biometric authentication');
        }
        // Surface our own descriptive errors (e.g. PRF unsupported) unchanged.
        if (error.message.includes('PRF') || error.message.includes('secure biometric')) {
          throw error;
        }
      }
      throw new Error('Failed to register biometric authentication');
    }
  }

  /**
   * Authenticate with stored credentials and decrypt the master password.
   * Triggers the biometric prompt, then derives the key from the PRF output.
   * @returns the decrypted password and the credential id that authenticated.
   */
  async authenticateAndDecrypt(
    credentials: BiometricCredential[]
  ): Promise<{ password: string; credentialId: string }> {
    if (credentials.length === 0) {
      throw new Error('No biometric credentials available');
    }

    // Reject legacy (v1) credentials that lack a PRF salt — they used the old,
    // insecure scheme and must be re-enrolled.
    const usable = credentials.filter((c) => c.prfSalt);
    if (usable.length === 0) {
      throw new Error(
        'Your saved biometric credential uses an outdated, insecure format and ' +
          'has been disabled. Please unlock with your master password and re-enable ' +
          'biometric unlock in Settings.'
      );
    }

    const prfSaltByCredential = new Map<string, ArrayBuffer>();
    for (const c of usable) {
      prfSaltByCredential.set(c.id, this.base64ToArrayBuffer(c.prfSalt!));
    }

    const { credentialId, prfOutput } = await this.evaluatePrf(
      usable.map((c) => c.id),
      prfSaltByCredential
    );

    const credential = usable.find((c) => c.id === credentialId);
    if (!credential) {
      throw new Error('Authenticated credential not found in storage');
    }

    const hkdfSalt = new Uint8Array(
      this.base64ToArrayBuffer(credential.encryptedPassword.salt)
    );
    const key = await this.deriveKeyFromPrf(prfOutput, hkdfSalt);

    const iv = new Uint8Array(this.base64ToArrayBuffer(credential.encryptedPassword.iv));
    const ciphertext = this.base64ToArrayBuffer(credential.encryptedPassword.ciphertext);

    let decrypted: ArrayBuffer;
    try {
      decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        ciphertext
      );
    } catch {
      throw new Error('Biometric unlock failed to decrypt the stored password');
    }

    return {
      password: new TextDecoder().decode(decrypted),
      credentialId,
    };
  }

  /**
   * Re-encrypt the password for an existing credential (used on password change).
   * Requires a fresh PRF assertion to obtain the credential's key material.
   */
  async reencryptPassword(
    password: string,
    credential: BiometricCredential
  ): Promise<EncryptedData> {
    if (!credential.prfSalt) {
      throw new Error('Cannot re-encrypt a legacy credential; re-enroll instead');
    }

    const prfSaltByCredential = new Map<string, ArrayBuffer>([
      [credential.id, this.base64ToArrayBuffer(credential.prfSalt)],
    ]);
    const { prfOutput } = await this.evaluatePrf([credential.id], prfSaltByCredential);

    const hkdfSalt = crypto.getRandomValues(new Uint8Array(16));
    const key = await this.deriveKeyFromPrf(prfOutput, hkdfSalt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      new TextEncoder().encode(password)
    );

    return {
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(hkdfSalt),
      ciphertext: this.arrayBufferToBase64(ciphertext),
      version: 2,
    };
  }
}

export const webAuthnService = new WebAuthnService();
