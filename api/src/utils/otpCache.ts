interface OTPEntry {
  otp: string;
  name?: string;
  expiresAt: number;
}

const timeout = 15 * 60 * 1000; // 15 minutes

class OTPCache {
  private cache: Map<string, OTPEntry> = new Map();

  set(email: string, otp: string, name?: string): void {
    const expiresAt = Date.now() + timeout;

    this.cache.set(email.toLowerCase(), { otp, name, expiresAt });
  }

  get(email: string): OTPEntry | null {
    const entry = this.cache.get(email.toLowerCase());

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(email.toLowerCase());

      return null;
    }

    return entry;
  }

  delete(email: string): void {
    this.cache.delete(email.toLowerCase());
  }

  cleanupExpired(): void {
    const now = Date.now();

    for (const [email, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(email);
      }
    }
  }
}

const otpCache = new OTPCache();

setInterval(() => {
  otpCache.cleanupExpired();
}, timeout);

export default otpCache;
