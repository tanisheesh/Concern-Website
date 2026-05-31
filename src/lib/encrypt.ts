/**
 * AES-256-GCM encryption utilities for storing sensitive data (OAuth tokens)
 * in Firestore.
 *
 * Required environment variable:
 *   TOKEN_ENCRYPTION_KEY — 64 hex characters (32 bytes)
 *
 * Generate a key with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;   // 96-bit IV recommended for GCM
const TAG_LENGTH = 16;  // 128-bit auth tag

function getEncryptionKey(): Buffer {
  const hex = process.env.TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  return Buffer.from(hex, 'hex');
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string in the format: iv:ciphertext:authTag
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Encode as iv:ciphertext:authTag (all base64)
  return [
    iv.toString('base64'),
    encrypted.toString('base64'),
    authTag.toString('base64'),
  ].join(':');
}

/**
 * Decrypts a string produced by `encrypt()`.
 * Throws if the ciphertext has been tampered with (GCM auth tag mismatch).
 */
export function decrypt(encoded: string): string {
  const key = getEncryptionKey();
  const parts = encoded.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted token format.');
  }

  const [ivB64, ciphertextB64, authTagB64] = parts;
  const iv = Buffer.from(ivB64!, 'base64');
  const ciphertext = Buffer.from(ciphertextB64!, 'base64');
  const authTag = Buffer.from(authTagB64!, 'base64');

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
