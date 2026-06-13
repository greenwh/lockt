// src/services/crypto.service.test.ts

import { describe, it, expect } from 'vitest';
import { cryptoService } from './crypto.service';
import { BIP39_WORDLIST } from '../utils/bip39-wordlist';

describe('cryptoService.encrypt/decrypt', () => {
  it('round-trips data with the correct password', async () => {
    const plaintext = JSON.stringify({ secret: 'hunter2', n: 42 });
    const encrypted = await cryptoService.encrypt(plaintext, 'master-password');

    expect(encrypted.iv).toBeTruthy();
    expect(encrypted.salt).toBeTruthy();
    expect(encrypted.ciphertext).toBeTruthy();
    expect(encrypted.version).toBe(1);

    const decrypted = await cryptoService.decrypt(encrypted, 'master-password');
    expect(decrypted).toBe(plaintext);
  });

  it('fails to decrypt with the wrong password', async () => {
    const encrypted = await cryptoService.encrypt('top secret', 'right-password');
    await expect(cryptoService.decrypt(encrypted, 'wrong-password')).rejects.toThrow();
  });

  it('produces a fresh IV (and ciphertext) each call', async () => {
    const a = await cryptoService.encrypt('same data', 'pw');
    const b = await cryptoService.encrypt('same data', 'pw');
    expect(a.iv).not.toBe(b.iv);
    expect(a.ciphertext).not.toBe(b.ciphertext);
  });

  it('reuses a provided salt but still decrypts correctly', async () => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await cryptoService.encrypt('payload', 'pw', salt);
    const decrypted = await cryptoService.decrypt(encrypted, 'pw');
    expect(decrypted).toBe('payload');
  });

  it('round-trips unicode and large payloads', async () => {
    const big = '🔒'.repeat(5000) + 'café — naïve';
    const encrypted = await cryptoService.encrypt(big, 'pw');
    expect(await cryptoService.decrypt(encrypted, 'pw')).toBe(big);
  });
});

describe('cryptoService recovery-phrase escrow', () => {
  it('encrypts the password under the recovery phrase and recovers it', async () => {
    const password = 'my-master-password';
    const phrase = 'abandon ability able about above absent absorb abstract absurd abuse access accident';

    const escrow = await cryptoService.encryptPasswordWithRecoveryPhrase(password, phrase);
    const recovered = await cryptoService.decryptPasswordWithRecoveryPhrase(escrow, phrase);
    expect(recovered).toBe(password);
  });

  it('does not recover the password with a different phrase', async () => {
    const escrow = await cryptoService.encryptPasswordWithRecoveryPhrase(
      'pw',
      'abandon ability able about above absent absorb abstract absurd abuse access accident'
    );
    await expect(
      cryptoService.decryptPasswordWithRecoveryPhrase(
        escrow,
        'zone zoo zebra zero young youth wrong write worth world work word'
      )
    ).rejects.toThrow();
  });
});

describe('cryptoService.generateRecoveryPhrase', () => {
  it('generates 12 words, all from the BIP39 wordlist', async () => {
    const { words, checksum } = await cryptoService.generateRecoveryPhrase();
    expect(words).toHaveLength(12);
    const wordSet = new Set(BIP39_WORDLIST);
    for (const word of words) {
      expect(wordSet.has(word)).toBe(true);
    }
    expect(checksum).toBeTruthy();
  });
});

describe('cryptoService.validateRecoveryPhrase', () => {
  const valid = BIP39_WORDLIST.slice(0, 12).join(' ');

  it('accepts a 12-word phrase of valid BIP39 words', () => {
    expect(cryptoService.validateRecoveryPhrase(valid)).toBe(true);
  });

  it('is case-insensitive and tolerates extra whitespace', () => {
    expect(
      cryptoService.validateRecoveryPhrase('  ' + valid.toUpperCase().replace(/ /g, '   ') + '  ')
    ).toBe(true);
  });

  it('rejects the wrong number of words', () => {
    expect(cryptoService.validateRecoveryPhrase(BIP39_WORDLIST.slice(0, 11).join(' '))).toBe(false);
    expect(cryptoService.validateRecoveryPhrase(BIP39_WORDLIST.slice(0, 13).join(' '))).toBe(false);
  });

  it('rejects a phrase containing a non-BIP39 word (typo)', () => {
    const withTypo = BIP39_WORDLIST.slice(0, 11).join(' ') + ' notabip39word';
    expect(cryptoService.validateRecoveryPhrase(withTypo)).toBe(false);
  });
});
