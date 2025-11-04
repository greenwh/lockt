// src/services/webauthn.service.ts

import type { EncryptedData } from '../types/data.types';

/**
 * WebAuthn Credential stored in IndexedDB
 */
export interface BiometricCredential {
  id: string; // Base64-encoded credential ID
  publicKey: string; // Base64-encoded public key
  encryptedPassword: EncryptedData; // Password encrypted with credential-derived key
  deviceName: string; // User-friendly device label
  authenticatorType: 'platform' | 'cross-platform'; // Face ID, Touch ID, Windows Hello, etc.
  createdAt: number;
  lastUsedAt: number;
}

/**
 * WebAuthn Service
 * Handles biometric authentication using WebAuthn/Passkeys API
 */
class WebAuthnService {
  private readonly RP_NAME = 'Lockt';
  private readonly RP_ID = window.location.hostname;
  private readonly PBKDF2_ITERATIONS = 100000; // Iterations for credential ID key derivation
  private readonly KEY_LENGTH = 256;

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
   * Derive encryption key from credential ID
   * This allows us to encrypt/decrypt the password using the credential ID as key material
   */
  private async deriveKeyFromCredentialId(
    credentialId: string,
    salt: Uint8Array
  ): Promise<CryptoKey> {
    // Import credential ID as key material
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(credentialId),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive encryption key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt password with credential-derived key
   */
  private async encryptPasswordWithCredential(
    password: string,
    credentialId: string
  ): Promise<EncryptedData> {
    // Generate salt for key derivation
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive key from credential ID
    const key = await this.deriveKeyFromCredentialId(credentialId, salt);

    // Generate IV for encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt password
    const encodedPassword = new TextEncoder().encode(password);
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      encodedPassword
    );

    return {
      iv: this.arrayBufferToBase64(iv),
      salt: this.arrayBufferToBase64(salt),
      ciphertext: this.arrayBufferToBase64(ciphertext),
      version: 1,
    };
  }

  /**
   * Decrypt password with credential-derived key
   */
  private async decryptPasswordWithCredential(
    encryptedPassword: EncryptedData,
    credentialId: string
  ): Promise<string> {
    // Convert Base64 back to ArrayBuffers
    const iv = this.base64ToArrayBuffer(encryptedPassword.iv);
    const salt = this.base64ToArrayBuffer(encryptedPassword.salt);
    const ciphertext = this.base64ToArrayBuffer(encryptedPassword.ciphertext);

    // Derive same key from credential ID
    const key = await this.deriveKeyFromCredentialId(
      credentialId,
      new Uint8Array(salt)
    );

    // Decrypt password
    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) as BufferSource },
      key,
      ciphertext
    );

    return new TextDecoder().decode(decryptedData);
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

      // Create credential options
      const publicKeyOptions: PublicKeyCredentialCreationOptions = {
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
          authenticatorAttachment: 'platform', // Prefer platform authenticator (Face ID, Windows Hello)
          userVerification: 'required', // Require biometric/PIN
          residentKey: 'preferred', // Prefer discoverable credentials for passwordless
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'none', // Don't need attestation for most use cases
      };

      // Create credential
      const credential = (await navigator.credentials.create({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      // Extract credential data
      const response = credential.response as AuthenticatorAttestationResponse;
      const credentialId = this.arrayBufferToBase64(credential.rawId);
      const publicKey = this.arrayBufferToBase64(response.getPublicKey()!);

      // Encrypt password with credential-derived key
      const encryptedPassword = await this.encryptPasswordWithCredential(
        password,
        credentialId
      );

      // Create credential object
      const biometricCredential: BiometricCredential = {
        id: credentialId,
        publicKey: publicKey,
        encryptedPassword: encryptedPassword,
        deviceName: userName,
        authenticatorType: 'platform',
        createdAt: Date.now(),
        lastUsedAt: Date.now(),
      };

      console.log('WebAuthn credential registered successfully:', {
        id: credentialId.substring(0, 20) + '...',
        deviceName: userName,
      });

      return biometricCredential;
    } catch (error) {
      console.error('WebAuthn registration failed:', error);
      if (error instanceof Error) {
        // Provide user-friendly error messages
        if (error.name === 'NotAllowedError') {
          throw new Error('Biometric registration was cancelled or not allowed');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Biometric authentication is not supported on this device');
        } else if (error.name === 'InvalidStateError') {
          throw new Error('This device is already registered for biometric authentication');
        }
      }
      throw new Error('Failed to register biometric authentication');
    }
  }

  /**
   * Authenticate with existing WebAuthn credential
   * @param credentialIds - Array of credential IDs to allow for authentication
   * @returns Credential ID and decrypted password
   */
  async authenticate(
    credentialIds: string[]
  ): Promise<{ credentialId: string; password: string }> {
    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    if (credentialIds.length === 0) {
      throw new Error('No biometric credentials available');
    }

    try {
      const challenge = this.generateChallenge();

      // Create authentication options
      const publicKeyOptions: PublicKeyCredentialRequestOptions = {
        challenge: challenge as BufferSource,
        allowCredentials: credentialIds.map((id) => ({
          id: this.base64ToArrayBuffer(id),
          type: 'public-key',
          transports: ['internal'], // Platform authenticator
        })),
        userVerification: 'required', // Require biometric/PIN
        timeout: 60000,
        rpId: this.RP_ID,
      };

      // Get credential (triggers biometric prompt)
      const assertion = (await navigator.credentials.get({
        publicKey: publicKeyOptions,
      })) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Authentication failed');
      }

      const credentialId = this.arrayBufferToBase64(assertion.rawId);

      console.log('WebAuthn authentication successful:', {
        id: credentialId.substring(0, 20) + '...',
      });

      return { credentialId, password: '' }; // Password will be decrypted separately
    } catch (error) {
      console.error('WebAuthn authentication failed:', error);
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          throw new Error('Biometric authentication was cancelled or failed');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Biometric authentication is not supported on this device');
        }
      }
      throw new Error('Biometric authentication failed');
    }
  }

  /**
   * Authenticate and decrypt password in one step
   * @param credentials - Array of stored biometric credentials
   */
  async authenticateAndDecrypt(
    credentials: BiometricCredential[]
  ): Promise<string> {
    if (credentials.length === 0) {
      throw new Error('No biometric credentials available');
    }

    // Authenticate with WebAuthn
    const { credentialId } = await this.authenticate(
      credentials.map((c) => c.id)
    );

    // Find matching credential
    const credential = credentials.find((c) => c.id === credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    // Decrypt password using credential ID
    const password = await this.decryptPasswordWithCredential(
      credential.encryptedPassword,
      credentialId
    );

    return password;
  }

  /**
   * Re-encrypt password with existing credential ID
   * Used when changing password - keeps same credential but updates encrypted password
   */
  async reencryptPassword(
    password: string,
    credentialId: string
  ): Promise<EncryptedData> {
    return await this.encryptPasswordWithCredential(password, credentialId);
  }

  /**
   * Delete a WebAuthn credential (note: this only removes from our storage,
   * the authenticator may still have the credential)
   */
  async deleteCredential(credentialId: string): Promise<void> {
    console.log('Deleting credential:', credentialId.substring(0, 20) + '...');
    // Actual deletion happens in database service
  }
}

export const webAuthnService = new WebAuthnService();
