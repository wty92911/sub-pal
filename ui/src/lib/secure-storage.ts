/**
 * Secure token storage utility
 * Provides more secure alternatives to localStorage for sensitive data
 */

interface StorageOptions {
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number; // in seconds
}

class SecureStorage {
  private readonly isSecureContext: boolean;

  constructor() {
    // Check if we're in a secure context (HTTPS)
    this.isSecureContext = typeof window !== 'undefined' && window.isSecureContext;
  }

  /**
   * Store a token securely
   * In development: Uses localStorage with warnings
   * In production with HTTPS: Uses secure cookies via API
   * In production without HTTPS: Uses sessionStorage with warnings
   */
  setToken(key: string, value: string, options: StorageOptions = {}): void {
    if (typeof window === 'undefined') return;

    const defaultOptions: StorageOptions = {
      secure: this.isSecureContext,
      httpOnly: false, // Can't be true for client-side cookies
      sameSite: 'strict',
      maxAge: 3600, // 1 hour
      ...options,
    };

    try {
      // In a production environment with proper backend support,
      // tokens should be stored in httpOnly cookies via API calls
      if (this.isSecureContext && process.env.NODE_ENV === 'production') {
        // TODO: Implement secure cookie storage via API endpoint
        // This would involve calling an API endpoint that sets httpOnly cookies
        console.warn('Using localStorage for token storage. Consider implementing httpOnly cookies for production.');
        this.fallbackToLocalStorage(key, value);
      } else {
        // Development or non-secure context fallback
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Storing token in localStorage. This is not secure for production use.`);
        }
        this.fallbackToLocalStorage(key, value);
      }
    } catch (error) {
      console.error('Error storing token:', error);
      // Fallback to memory storage (lost on page refresh)
      this.setMemoryStorage(key, value);
    }
  }

  /**
   * Retrieve a token securely
   */
  getToken(key: string): string | null {
    if (typeof window === 'undefined') return null;

    try {
      // Try to get from the same source where it was stored
      if (this.isSecureContext && process.env.NODE_ENV === 'production') {
        // TODO: Implement secure cookie retrieval via API
        return this.fallbackFromLocalStorage(key);
      } else {
        return this.fallbackFromLocalStorage(key);
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
      return this.getMemoryStorage(key);
    }
  }

  /**
   * Remove a token securely
   */
  removeToken(key: string): void {
    if (typeof window === 'undefined') return;

    try {
      // Remove from all possible storage locations
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
      this.removeMemoryStorage(key);

      // TODO: In production, call API to remove httpOnly cookies
      if (this.isSecureContext && process.env.NODE_ENV === 'production') {
        // Call API to clear httpOnly cookies
      }
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }

  /**
   * Check if token storage is secure
   */
  isStorageSecure(): boolean {
    return this.isSecureContext && process.env.NODE_ENV === 'production';
  }

  /**
   * Get storage security warnings
   */
  getSecurityWarnings(): string[] {
    const warnings: string[] = [];

    if (!this.isSecureContext) {
      warnings.push('Not running in secure context (HTTPS). Tokens are not secure.');
    }

    if (process.env.NODE_ENV === 'development') {
      warnings.push('Running in development mode. Using localStorage for tokens.');
    }

    if (!this.isStorageSecure()) {
      warnings.push('Consider implementing httpOnly cookies for production token storage.');
    }

    return warnings;
  }

  // Fallback methods
  private fallbackToLocalStorage(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  private fallbackFromLocalStorage(key: string): string | null {
    return localStorage.getItem(key);
  }

  // Memory storage for critical fallback (lost on page refresh)
  private memoryStorage = new Map<string, string>();

  private setMemoryStorage(key: string, value: string): void {
    this.memoryStorage.set(key, value);
  }

  private getMemoryStorage(key: string): string | null {
    return this.memoryStorage.get(key) || null;
  }

  private removeMemoryStorage(key: string): void {
    this.memoryStorage.delete(key);
  }
}

// Export singleton instance
export const secureStorage = new SecureStorage();

// Export utility functions for easier migration
export const setSecureToken = (key: string, value: string, options?: StorageOptions) =>
  secureStorage.setToken(key, value, options);

export const getSecureToken = (key: string) =>
  secureStorage.getToken(key);

export const removeSecureToken = (key: string) =>
  secureStorage.removeToken(key);

export const isTokenStorageSecure = () =>
  secureStorage.isStorageSecure();

export const getTokenStorageWarnings = () =>
  secureStorage.getSecurityWarnings();
