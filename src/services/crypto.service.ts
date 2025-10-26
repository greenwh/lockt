// src/services/crypto.service.ts

import type { EncryptedData, RecoveryPhrase } from '../types/data.types';
import { BIP39_WORDLIST } from '../utils/bip39-wordlist';

/**
 * Cryptography Service
 * Handles all encryption, decryption, and key management operations
 */
class CryptoService {
  private readonly PBKDF2_ITERATIONS = 600000;
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12; // bytes
  private readonly SALT_LENGTH = 16; // bytes
  private readonly ENCRYPTION_VERSION = 1;

  /**
   * Generate a random salt for key derivation
   */
  private generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
  }

  /**
   * Generate a random IV for encryption
   */
  private generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
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
   * Derive a cryptographic key from password and salt
   */
  async deriveKey(
    password: string,
    salt: Uint8Array,
    recoveryPhrase?: string
  ): Promise<CryptoKey> {
    // Combine password with recovery phrase if provided
    const keyMaterial = recoveryPhrase 
      ? `${password}:${recoveryPhrase}` 
      : password;

    // Import password as key material
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(keyMaterial),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive actual encryption key
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      true, // extractable (for keychain storage)
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt data with derived key
   */
  async encrypt(
    data: string,
    password: string,
    salt?: Uint8Array,
    recoveryPhrase?: string
  ): Promise<EncryptedData> {
    try {
      console.log('Encrypting with password:', password.substring(0, 3) + '***');
      console.log('Data length:', data.length);

      // Generate salt if not provided (first-time encryption)
      const actualSalt = salt || this.generateSalt();
      console.log('Using salt length:', actualSalt.length);

      // Derive encryption key
      const key = await this.deriveKey(password, actualSalt, recoveryPhrase);
      console.log('Key derived successfully');

      // Generate IV
      const iv = this.generateIV();
      console.log('IV generated, length:', iv.length);

      // Encrypt data
      const encodedData = new TextEncoder().encode(data);
      console.log('Encoded data length:', encodedData.length);

      const ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv as BufferSource },
        key,
        encodedData
      );
      console.log('Encryption successful, ciphertext length:', new Uint8Array(ciphertext).length);

      const result = {
        iv: this.arrayBufferToBase64(iv),
        salt: this.arrayBufferToBase64(actualSalt),
        ciphertext: this.arrayBufferToBase64(ciphertext),
        version: this.ENCRYPTION_VERSION
      };

      console.log('EncryptedData result:', {
        iv: result.iv.substring(0, 20) + '...',
        salt: result.salt.substring(0, 20) + '...',
        ciphertext: result.ciphertext.substring(0, 20) + '...',
        version: result.version
      });

      return result;
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data with password
   */
  async decrypt(
    encryptedData: EncryptedData,
    password: string,
    recoveryPhrase?: string
  ): Promise<string> {
    try {
      // Convert Base64 strings back to ArrayBuffers
      console.log('Decrypting with password:', password.substring(0, 3) + '***');
      console.log('EncryptedData structure:', {
        iv: encryptedData.iv.substring(0, 20) + '...',
        salt: encryptedData.salt.substring(0, 20) + '...',
        ciphertext: encryptedData.ciphertext.substring(0, 20) + '...',
        version: encryptedData.version
      });

      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const salt = this.base64ToArrayBuffer(encryptedData.salt);
      const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);

      console.log('Converted buffers:', {
        ivLength: new Uint8Array(iv).length,
        saltLength: new Uint8Array(salt).length,
        ciphertextLength: new Uint8Array(ciphertext).length
      });

      // Derive key with same salt
      console.log('Deriving key with salt length:', new Uint8Array(salt).length);
      const key = await this.deriveKey(
        password,
        new Uint8Array(salt),
        recoveryPhrase
      );
      console.log('Key derived successfully');

      // Decrypt
      console.log('Starting decryption with AES-GCM...');
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(ciphertext)
      );

      console.log('Decryption successful, decoding...');
      // Decode to string
      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'unknown',
        message: error instanceof Error ? error.message : 'unknown'
      });
      throw new Error('Failed to decrypt data - incorrect password or corrupted data');
    }
  }

  /**
   * Generate a 12-word recovery phrase
   * Uses official BIP39 wordlist (2048 words)
   */
  async generateRecoveryPhrase(): Promise<RecoveryPhrase> {
    const words: string[] = [];
    const randomValues = new Uint32Array(12);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < 12; i++) {
      const index = randomValues[i] % BIP39_WORDLIST.length;
      words.push(BIP39_WORDLIST[index]);
    }

    // Generate checksum (simple hash of words)
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(words.join(' ')));
    const checksum = this.arrayBufferToBase64(hashBuffer);

    return { words, checksum };
  }

  /**
   * Validate recovery phrase format
   */
  validateRecoveryPhrase(phrase: string): boolean {
    const words = phrase.trim().toLowerCase().split(/\s+/);
    return words.length === 12;
  }

  /**
   * Hash password for storage (if needed for password verification)
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Encrypt password using recovery phrase (password escrow)
   * This allows recovery phrase to decrypt the password, which can then unlock data
   */
  async encryptPasswordWithRecoveryPhrase(
    password: string,
    recoveryPhrase: string
  ): Promise<EncryptedData> {
    // Use recovery phrase as the password for encryption
    // Generate new salt for this encryption (don't reuse data salt)
    const escrowSalt = this.generateSalt();

    // Encrypt the password using recovery phrase
    return await this.encrypt(password, recoveryPhrase, escrowSalt);
  }

  /**
   * Decrypt password using recovery phrase (password recovery)
   */
  async decryptPasswordWithRecoveryPhrase(
    encryptedPassword: EncryptedData,
    recoveryPhrase: string
  ): Promise<string> {
    // Decrypt the password using recovery phrase
    return await this.decrypt(encryptedPassword, recoveryPhrase);
  }
}

export const cryptoService = new CryptoService();
