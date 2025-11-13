/**
 * Multi-API Key Manager with automatic rotation and failover
 * Manages multiple Google Gemini API keys and rotates through them
 */

interface ApiKeyStatus {
  key: string;
  isAvailable: boolean;
  lastUsed: Date | null;
  failureCount: number;
  lastError: string | null;
}

class ApiKeyManager {
  private keys: ApiKeyStatus[] = [];
  private currentIndex: number = 0;
  private maxFailures: number = 3;
  private cooldownPeriod: number = 60000; // 1 minute in milliseconds

  constructor(apiKeys: string[]) {
    this.keys = apiKeys.map(key => ({
      key: key.trim(),
      isAvailable: true,
      lastUsed: null,
      failureCount: 0,
      lastError: null
    }));
  }

  /**
   * Get the next available API key
   */
  getNextKey(): string | null {
    if (this.keys.length === 0) {
      throw new Error('No API keys configured');
    }

    // Reset keys that have been in cooldown long enough
    this.resetCooledDownKeys();

    // Try to find an available key
    const startIndex = this.currentIndex;
    let attempts = 0;

    while (attempts < this.keys.length) {
      const keyStatus = this.keys[this.currentIndex];

      if (keyStatus.isAvailable) {
        keyStatus.lastUsed = new Date();
        const selectedKey = keyStatus.key;
        
        // Move to next key for round-robin
        this.currentIndex = (this.currentIndex + 1) % this.keys.length;
        
        console.log(`Using API key #${this.currentIndex} (${this.maskKey(selectedKey)})`);
        return selectedKey;
      }

      this.currentIndex = (this.currentIndex + 1) % this.keys.length;
      attempts++;
    }

    // All keys are unavailable
    console.error('All API keys are currently unavailable');
    return null;
  }

  /**
   * Mark a key as failed
   */
  markKeyAsFailed(key: string, error: string): void {
    const keyStatus = this.keys.find(k => k.key === key);
    
    if (keyStatus) {
      keyStatus.failureCount++;
      keyStatus.lastError = error;

      if (keyStatus.failureCount >= this.maxFailures) {
        keyStatus.isAvailable = false;
        console.warn(
          `API key ${this.maskKey(key)} marked as unavailable after ${keyStatus.failureCount} failures. ` +
          `Will retry after cooldown period.`
        );
      }
    }
  }

  /**
   * Mark a key as successful
   */
  markKeyAsSuccess(key: string): void {
    const keyStatus = this.keys.find(k => k.key === key);
    
    if (keyStatus) {
      keyStatus.failureCount = 0;
      keyStatus.isAvailable = true;
      keyStatus.lastError = null;
    }
  }

  /**
   * Reset keys that have been in cooldown long enough
   */
  private resetCooledDownKeys(): void {
    const now = Date.now();
    
    this.keys.forEach(keyStatus => {
      if (!keyStatus.isAvailable && keyStatus.lastUsed) {
        const timeSinceLastUse = now - keyStatus.lastUsed.getTime();
        
        if (timeSinceLastUse >= this.cooldownPeriod) {
          keyStatus.isAvailable = true;
          keyStatus.failureCount = 0;
          keyStatus.lastError = null;
          console.log(`API key ${this.maskKey(keyStatus.key)} is back online after cooldown`);
        }
      }
    });
  }

  /**
   * Get status of all keys
   */
  getStatus(): Array<{
    key: string;
    isAvailable: boolean;
    failureCount: number;
    lastUsed: Date | null;
    lastError: string | null;
  }> {
    return this.keys.map(k => ({
      key: this.maskKey(k.key),
      isAvailable: k.isAvailable,
      failureCount: k.failureCount,
      lastUsed: k.lastUsed,
      lastError: k.lastError
    }));
  }

  /**
   * Mask API key for logging (show only first and last 4 characters)
   */
  private maskKey(key: string): string {
    if (key.length <= 8) return '****';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  /**
   * Get total number of keys
   */
  getTotalKeys(): number {
    return this.keys.length;
  }

  /**
   * Get number of available keys
   */
  getAvailableKeysCount(): number {
    return this.keys.filter(k => k.isAvailable).length;
  }
}

// Singleton instance
let apiKeyManagerInstance: ApiKeyManager | null = null;

/**
 * Initialize the API key manager with keys from environment
 */
export function initializeApiKeyManager(): ApiKeyManager {
  if (apiKeyManagerInstance) {
    return apiKeyManagerInstance;
  }

  // Get API keys from environment variables
  const apiKeys: string[] = [];
  
  // Primary key
  if (process.env.GOOGLE_API_KEY) {
    apiKeys.push(process.env.GOOGLE_API_KEY);
  }
  
  // Additional keys (GOOGLE_API_KEY_2, GOOGLE_API_KEY_3, etc.)
  let i = 2;
  while (process.env[`GOOGLE_API_KEY_${i}`]) {
    apiKeys.push(process.env[`GOOGLE_API_KEY_${i}`]!);
    i++;
  }

  if (apiKeys.length === 0) {
    throw new Error('No Google API keys found in environment variables');
  }

  console.log(`Initialized API Key Manager with ${apiKeys.length} key(s)`);
  
  apiKeyManagerInstance = new ApiKeyManager(apiKeys);
  return apiKeyManagerInstance;
}

/**
 * Get the API key manager instance
 */
export function getApiKeyManager(): ApiKeyManager {
  if (!apiKeyManagerInstance) {
    return initializeApiKeyManager();
  }
  return apiKeyManagerInstance;
}

/**
 * Execute a function with automatic API key rotation on failure
 */
export async function executeWithKeyRotation<T>(
  fn: (apiKey: string) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const manager = getApiKeyManager();
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const apiKey = manager.getNextKey();
    
    if (!apiKey) {
      throw new Error('No available API keys. All keys are currently rate-limited or failed.');
    }
    
    try {
      const result = await fn(apiKey);
      manager.markKeyAsSuccess(apiKey);
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error?.message || 'Unknown error';
      
      console.error(`API call failed with key ${manager['maskKey'](apiKey)}: ${errorMessage}`);
      
      // Check if it's a rate limit or overload error
      if (
        errorMessage.includes('503') ||
        errorMessage.includes('overloaded') ||
        errorMessage.includes('429') ||
        errorMessage.includes('quota')
      ) {
        manager.markKeyAsFailed(apiKey, errorMessage);
        console.log(`Attempting retry ${attempt + 1}/${maxRetries} with next key...`);
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
      
      // For other errors, don't retry
      throw error;
    }
  }
  
  throw lastError || new Error('All retry attempts failed');
}
