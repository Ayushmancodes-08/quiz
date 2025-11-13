/**
 * Encryption utilities for quiz content
 * Ensures questions/answers are encrypted in transit and at rest
 */

/**
 * Generate a random encryption key
 */
export function generateKey(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Encrypt text using AES-GCM
 */
export async function encryptText(text: string, key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Convert hex key to CryptoKey
  const keyData = new Uint8Array(key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Generate IV
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt text using AES-GCM
 */
export async function decryptText(encryptedText: string, key: string): Promise<string> {
  // Convert from base64
  const combined = new Uint8Array(
    atob(encryptedText).split('').map(char => char.charCodeAt(0))
  );
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const encrypted = combined.slice(12);
  
  // Convert hex key to CryptoKey
  const keyData = new Uint8Array(key.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encrypted
  );
  
  // Convert to string
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt quiz question object
 */
export async function encryptQuestion(question: {
  id: string;
  question: string;
  options: string[];
  correctAnswer?: string;
}, key: string): Promise<string> {
  const json = JSON.stringify(question);
  return await encryptText(json, key);
}

/**
 * Decrypt quiz question object
 */
export async function decryptQuestion(encryptedQuestion: string, key: string): Promise<{
  id: string;
  question: string;
  options: string[];
  correctAnswer?: string;
}> {
  const json = await decryptText(encryptedQuestion, key);
  return JSON.parse(json);
}

/**
 * XOR cipher for lightweight obfuscation
 */
export function xorCipher(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return btoa(result);
}

/**
 * XOR decipher
 */
export function xorDecipher(encrypted: string, key: string): string {
  const text = atob(encrypted);
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * ROT13 cipher (simple obfuscation)
 */
export function rot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const start = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
  });
}

/**
 * Base64 encode with URL-safe characters
 */
export function base64UrlEncode(text: string): string {
  return btoa(text)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Base64 decode with URL-safe characters
 */
export function base64UrlDecode(encoded: string): string {
  const base64 = encoded
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  return atob(base64 + padding);
}

/**
 * Multi-layer encryption
 */
export async function multiLayerEncrypt(text: string, keys: string[]): Promise<string> {
  let encrypted = text;
  
  // Layer 1: XOR
  encrypted = xorCipher(encrypted, keys[0] || 'default-key-1');
  
  // Layer 2: ROT13
  encrypted = rot13(encrypted);
  
  // Layer 3: AES-GCM
  if (keys[1]) {
    encrypted = await encryptText(encrypted, keys[1]);
  }
  
  // Layer 4: Base64 URL-safe
  encrypted = base64UrlEncode(encrypted);
  
  return encrypted;
}

/**
 * Multi-layer decryption
 */
export async function multiLayerDecrypt(encrypted: string, keys: string[]): Promise<string> {
  let decrypted = encrypted;
  
  // Layer 4: Base64 URL-safe
  decrypted = base64UrlDecode(decrypted);
  
  // Layer 3: AES-GCM
  if (keys[1]) {
    decrypted = await decryptText(decrypted, keys[1]);
  }
  
  // Layer 2: ROT13
  decrypted = rot13(decrypted);
  
  // Layer 1: XOR
  decrypted = xorDecipher(decrypted, keys[0] || 'default-key-1');
  
  return decrypted;
}

/**
 * Generate session-specific encryption key
 */
export function generateSessionKey(userId: string, quizId: string, timestamp: number): string {
  const data = `${userId}-${quizId}-${timestamp}`;
  const hash = Array.from(data).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  return Math.abs(hash).toString(36).padStart(32, '0').slice(0, 32);
}

/**
 * Obfuscate answer in HTML (never expose correct answer)
 */
export function obfuscateAnswer(answer: string): string {
  // Hash the answer so it can be verified but not read
  return Array.from(answer).reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0).toString(36);
}

/**
 * Verify obfuscated answer
 */
export function verifyObfuscatedAnswer(userAnswer: string, obfuscatedCorrect: string): boolean {
  return obfuscateAnswer(userAnswer) === obfuscatedCorrect;
}
