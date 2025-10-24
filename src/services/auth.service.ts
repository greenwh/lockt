// src/services/auth.service.ts

/**
 * Authentication Service
 * Handles password hashing, verification, and session management
 * NO ENCRYPTION - just password protection for app access
 */
class AuthService {
  private readonly PASSWORD_HASH_KEY = 'lockt-password-hash';
  private readonly SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private sessionTimer: NodeJS.Timeout | null = null;

  /**
   * Hash password using SHA-256
   */
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Verify password against stored hash
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const hash = await this.hashPassword(password);
    return hash === storedHash;
  }

  /**
   * Set up initial password (first-time setup)
   */
  async setupPassword(password: string): Promise<void> {
    const hash = await this.hashPassword(password);
    localStorage.setItem(this.PASSWORD_HASH_KEY, hash);
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    const storedHash = localStorage.getItem(this.PASSWORD_HASH_KEY);
    if (!storedHash) {
      throw new Error('No password set');
    }

    const isValid = await this.verifyPassword(currentPassword, storedHash);
    if (!isValid) {
      return false;
    }

    await this.setupPassword(newPassword);
    return true;
  }

  /**
   * Check if password is set
   */
  hasPassword(): boolean {
    return localStorage.getItem(this.PASSWORD_HASH_KEY) !== null;
  }

  /**
   * Get stored password hash
   */
  getPasswordHash(): string | null {
    return localStorage.getItem(this.PASSWORD_HASH_KEY);
  }

  /**
   * Start session timeout
   */
  startSessionTimeout(onTimeout: () => void): void {
    this.clearSessionTimeout();
    this.sessionTimer = setTimeout(() => {
      onTimeout();
    }, this.SESSION_TIMEOUT);
  }

  /**
   * Reset session timeout (on user activity)
   */
  resetSessionTimeout(onTimeout: () => void): void {
    this.startSessionTimeout(onTimeout);
  }

  /**
   * Clear session timeout
   */
  clearSessionTimeout(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  /**
   * Validate password strength
   */
  validatePasswordStrength(password: string): { 
    valid: boolean; 
    errors: string[] 
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Clear all auth data (for app reset)
   */
  clearAuth(): void {
    localStorage.removeItem(this.PASSWORD_HASH_KEY);
    this.clearSessionTimeout();
  }
}

export const authService = new AuthService();
