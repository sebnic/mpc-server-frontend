/**
 * Simple encryption/decryption service using Web Crypto API
 * Note: This provides basic obfuscation, not military-grade security
 * For production, consider more robust solutions
 */

export class CryptoService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  /**
   * Derives a key from a passphrase using PBKDF2
   */
  private static async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      this.encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts a string using AES-GCM
   */
  static async encrypt(plaintext: string, passphrase: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.deriveKey(passphrase, salt);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      this.encoder.encode(plaintext)
    );

    // Combine salt + iv + encrypted data
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);

    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Decrypts a string using AES-GCM
   */
  static async decrypt(ciphertext: string, passphrase: string): Promise<string> {
    try {
      // Convert from base64
      const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));

      // Extract salt, iv, and encrypted data
      const salt = combined.slice(0, 16);
      const iv = combined.slice(16, 28);
      const encrypted = combined.slice(28);

      const key = await this.deriveKey(passphrase, salt);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        key,
        encrypted
      );

      return this.decoder.decode(decrypted);
    } catch (error) {
      throw new Error('Decryption failed. Invalid passphrase or corrupted data.');
    }
  }

  /**
   * Generates a device-specific passphrase based on browser fingerprint
   * This is used to encrypt/decrypt secrets at runtime
   */
  static async generateDevicePassphrase(): Promise<string> {
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      new Date().getTimezoneOffset(),
      screen.width,
      screen.height,
      'mcp-browser-salt', // Static salt
    ].join('|');

    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(fingerprint)
    );

    return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  }
}
